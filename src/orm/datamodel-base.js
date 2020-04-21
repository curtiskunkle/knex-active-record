import { getPropFromObject, isObject } from '../helpers';
import { BELONGS_TO, HAS_MANY, HAS_ONE, HAS_MANY_THROUGH } from './constants';

/**
 * Base class that other data models will extend
 */
export default class DataModelBase {
	constructor() {
		this.constructAttributes();
		this.applyRelations();
		this._loadedRelations = {};
	}

	/**
	 * Get the primary key.  Default if not defined is id
	 * @return string
	 */
	static _pk() {
		return this.model_definition.pk || "id"
	}

	/**
	 * Convenience method for getting pk in instance methods
	 * @return string
	 */
	_pk() {
		return this.constructor._pk();
	}

	/**
	 * Return this models table name
	 * @return string
	 */
	static _table() {
		return this.model_definition.table;
	}

	/**
	 * return the primary key of this instance
	 * @return mixed
	 */
	_id() {
		return this[this._pk()];
	}

	/**
	 * Insert or update instance
	 * @param  object transaction optional knex transaction object
	 * @return resolved Promise
	 */
	async save(transaction = null) {
		const knex = this.constructor.ORM.knex;
		const def = this.constructor.model_definition;
		const inserting = !this._id();
		const attributeKeys = Object.keys(def.attributes);

		//assert required flag and attribute level validation
		for (let i = 0; i < attributeKeys.length; i++) {
			let thisKey = attributeKeys[i];
			let isRequired = getPropFromObject('required', def.attributes[thisKey]);
			let validate = getPropFromObject('validate', def.attributes[thisKey]);
			if (isRequired && !this[thisKey]) {
				return Promise.reject(new Error(`${this.constructor.name} missing required attribute [${thisKey}]`));
			}
			if (typeof validate === 'function' && ! await validate(this[thisKey])) {
				return Promise.reject(new Error(`${this.constructor.name} [${thisKey}] attribute failed validation`));
			}
		}

		//assert instance level validation
		if (!(await this.validate())) {
			return Promise.reject(new Error(`${this.constructor.name} failed validation`));
		}

		//get values for save
		let values = {};
		attributeKeys.map(attr => {
			if (attr != this._pk()) {
				values[attr] = this[attr];
			}
		});

		let savePromise = inserting
			? knex(def.table).insert(values)
			: knex(def.table).where(this.constructor.attr(this._pk()), this._id()).update(values);

		try {
			let result = transaction ? await savePromise.transacting(transaction) : await savePromise;
			if (inserting) this[this._pk()] = result[0];
			let savedObject = await this.constructor.get(this._id());
			for(let i = 0; i < attributeKeys.length; i++) {
				this[Object.keys(def.attributes)[i]] = savedObject[Object.keys(def.attributes)[i]];
			}
			return Promise.resolve(true);
		} catch(err) {
			this.debug(err);
			return Promise.reject(false);
		}
	};

	/**
	 * Override to apply instance level validation function when saving
	 */
	validate() {
		return true;
	}

	/**
	 * Called after object is constructed from query response in find functions
	 * Override this function to apply instance level transform
	 *
	 * Note: Adding properties to the object here is not recommended as they will not be present on the
	 * object after it is saved - only after a find() function is called.  Instead, this should really only
	 * be used for transforming attributes that exist in the model definition.
	 */
	transform() {
		return true;
	}

	/**
	 * Delete this instance
	 * @param  object transaction optional knex transaction object
	 * @return pending Promise
	 */
	delete(transaction = null) {
		const knex = this.constructor.ORM.knex;
		const def = this.constructor.model_definition;
		const deletion = knex(def.table).where(this.constructor.attr(this._pk()), this._id()).del();
		return transaction ? deletion.transacting(transaction) : deletion;
	}

	/**
	 * Query this model's table and return promise that resolves to array of instances for found rows
	 * @return pending Promise
	 */
	static find() {
		const knex = this.ORM.knex;
		const def = this.model_definition;
		return knex.select().column(this.getTableColumns()).from(def.table).queryContext({
			ormtransform: transformQueryResults(def, this)
		});
	}

	/**
	 * Query this model's table and return promise that resolves to instance for first found row
	 * @return pending Promise
	 */
	static findOne() {
		const knex = this.ORM.knex;
		const def = this.model_definition;
		return knex.select().limit(1).column(this.getTableColumns()).from(def.table).queryContext({
			ormtransform: transformQueryResults(def, this),
			returnSingleObject: true,
		});
	}

	/**
	 * Query this model's table by primary key and return promise that resolves to instance
	 * @return pending Promise
	 */
	static get(id) {
		const def = this.model_definition;
		return this.findOne().where(this.attr(this._pk()), id);
	}

	static getTableColumns() {
		const def = this.model_definition;
		let that = this;
		return Object.keys(def.attributes).map(key => {
			return that.attr(key);
		});
	}

	/**
	 * Helper function for getting SQL attribute string formatted like table.field
	 * @param  string attribute
	 * @return string
	 */
	static attr(attribute) {
		return `${this._table()}.${attribute}`;
	}

	/**
	 * Instantiate defined attributes on instance object
	 */
	constructAttributes() {
		const def = this.constructor.model_definition;
		let that = this;
		Object.keys(def.attributes).map(attr => {
			that[attr] = undefined;
		});
	}

	/**
	 * Create functions on instance for fetching defined relationships
	 */
	applyRelations() {
		const def = this.constructor.model_definition;
		let that = this;
		let relationTypes = [HAS_MANY, BELONGS_TO, HAS_ONE, HAS_MANY_THROUGH];
		relationTypes.map(relType => {
			if (isObject(def[relType])) {
				Object.keys(def[relType]).map(relationName => {
					let config = def[relType][relationName];
					if (isObject(config)) {
						if (relType === HAS_MANY_THROUGH && config.through && config.relationship) {
							that[relationName] = () => {
								return that._doRelation(relationName, relType,  () => {
									return that["_" + relType](config.through, config.relationship);
								}
							)};
						} else if (config.model && config.key) {
							that[relationName] = () => {
								return that._doRelation(relationName, relType,  async () => {
									return that["_" + relType](config.model, config.key);
								}
							)};
						}
					}
				});
			}
		});
	}

	//this should wrap other relationship functions
	//should perform checking for loaded relationship and populating it
	async _doRelation(key, type, getFunc) {
		if (!this._id()) return relationDefault(type);
		if (typeof this._loadedRelations[key] !== 'undefined') return this._loadedRelations[key];
		const result = await getFunc();
		if ((Array.isArray(result) && result.length) || !Array.isArray(result) && result) {
			this._loadedRelations[key] = result;
		}
		return result;
	}

	async _hasMany(model, key) {
		const ORM = this.constructor.ORM;
		const modelClass = ORM.modelRegistry[model];
		if (!modelClass) {
			this.debug("Invalid model provided for hasMany relationship");
			return Promise.resolve([]);
		}
		try {
			return await modelClass.find().where(modelClass.attr(key), this._id());
		} catch(err) {
			debug(err);
			return Promise.resolve([]);
		}
	}

	async _belongsTo(model, key) {
		const ORM = this.constructor.ORM;
		const modelClass = ORM.modelRegistry[model];
		if (!modelClass) {
			this.debug("Invalid model provided for belongsTo relationship");
			return Promise.resolve(null);
		}
		try {
			return await modelClass.get(this[key]);
		} catch(err) {
			debug(err);
			return Promise.resolve(null);
		}
	}


	async _hasOne(model, key) {
		const ORM = this.constructor.ORM;
		const modelClass = ORM.modelRegistry[model];
		if (!modelClass) {
			this.debug("Invalid model provided for belongsTo relationship");
			return Promise.resolve(null);
		}
		try {
			return await modelClass.findOne().where(modelClass.attr(key), this._id());
		} catch(err) {
			debug(err);
			return Promise.resolve(null);
		}
	}

	//@TODO finish this up - should work with other relationships too
	async _hasManyThrough(throughRelation, targetRelation) {
		const ORM = this.constructor.ORM;
		const data = ORM.getThroughRelationshipData(this.constructor.name, throughRelation, targetRelation);
		if (typeof data === 'string') {
			this.debug(data);
			return [];
		}
		const relationshipCombination = data.throughRelationshipType + '-' + data.targetRelationshipType;
		const throughModel = ORM.modelRegistry[data.throughModel];
		const targetModel = ORM.modelRegistry[data.targetModel];
		const { throughKey, targetKey } = data;
		try {
			switch(relationshipCombination) {
				case `${HAS_MANY}-${HAS_MANY}`:
			    	return await targetModel
					.find()
					.join(
						throughModel._table(),
						throughModel.attr(throughModel._pk()),
						'=',
						targetModel.attr(targetKey)
					)
					.join(
						this.constructor._table(),
						this.constructor.attr(this._pk()),
						'=',
						throughModel.attr(throughKey)
					)
					.where(this.constructor.attr(this.constructor._pk()), this._id());
			    break;

			  	default:
			    	this.debug(`Invalid relationship combination for hasManyThrough ${relationshipCombination}`);
			    	return Promise.resolve([]);
			}
		} catch(err) {
			this.debug(err);
			return Promise.resolve([]);
		}
	}

	static debug(message) {
		console.log(message);
	}

	debug(message) {
		this.constructor.debug(message);
	}
}

function relationDefault(type) {
	if (type === HAS_MANY || type === HAS_MANY_THROUGH) {
		return [];
	}
	return null
}

/**
 * Turn result rows into model instances
 *
 * Maps results of query to model instance properties
 * Also applies attribute level and instance level transform functions (in that order)
 *
 * @param  object   model_definition
 * @param  function classConstructor
 * @return array of instances
 */
function transformQueryResults(model_definition, classConstructor) {
	return results => {
		let grouped = {};
		results.map(result => {
			const object = new classConstructor();
			Object.keys(model_definition.attributes).map(attr => {
				if (typeof result[attr] !== 'undefined') {
					const transform = getPropFromObject('transform', model_definition.attributes[attr]);
					object[attr] = typeof transform === 'function' ? transform(result[attr]) :  result[attr];
				}
			});
			object.transform();
			grouped[object[classConstructor._pk()]] = object;
		});
		return Object.values(grouped);
	};
}
