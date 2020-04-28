import { getPropFromObject, isObject } from '../helpers';
import { BELONGS_TO, HAS_MANY, HAS_ONE, HAS_MANY_THROUGH, BELONGS_TO_THROUGH, HAS_ONE_THROUGH } from './constants';
import { MissingRequiredAttributeError, InvalidAttributeError, InavlidInstanceError } from './errors';

/**
 * Base class that other data models will extend
 */
export default class DataModelBase {
	constructor() {
		this.constructAttributes();
		this.applyRelations();
	}

	/**
	 * Get the primary key.  Default if not defined is id
	 * @return string
	 */
	static _pk() {
		return this.model_definition.pk || "id"
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
		return this[this.constructor._pk()];
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
				throw new MissingRequiredAttributeError(this, thisKey);
			}
			if (typeof validate === 'function' && ! await validate(this[thisKey])) {
				throw new InvalidAttributeError(this, thisKey);
			}
		}

		//assert instance level validation
		if (!(await this.validate())) {
			throw new InavlidInstanceError(this);
		}

		//get values for save
		const values = getSaveValues(this);

		//if updating a record with all undefined attributes, return promise here to avoid error.
		if (this._id() && Object.values(values).every(val => val === undefined)) {
			return Promise.resolve(true);
		}

		let savePromise = inserting
			? this.constructor.query().insert(values)
			: this.constructor.query().where(this.constructor.attr(this.constructor._pk()), this._id()).update(values);

		try {
			let result = transaction ? await savePromise.transacting(transaction) : await savePromise;
			if (inserting) this[this.constructor._pk()] = result[0];

			return Promise.resolve(true);
		} catch(err) {
			this.debug(err);
			throw err;
		}
	};

	static batchCreate(modelInstances, transaction, chunk = 1000) {
		const ORM = this.ORM;
		let rows = [];
		if (Array.isArray(modelInstances)) {
			rows = modelInstances.map(instance => {
				if (ORM.isModelInstance(instance)) {
					return getSaveValues(instance);
				}
			});
		}
		return transaction
			? ORM.knex.batchInsert(this._table(), rows, chunk).transacting(transaction)
			: ORM.knex.batchInsert(this._table(), rows, chunk);
	}

	static update(...args) {
		const builder = this.query();
		return builder.update.apply(builder, args);
	}

	static delete() {
		return this.ORM.knex(this._table()).delete();
	}

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
		if (!this._id()) return Promise.resolve(0);
		const deletion = this.constructor.query().where(this.constructor.attr(this.constructor._pk()), this._id()).del();
		return transaction ? deletion.transacting(transaction) : deletion;
	}

	static query() {
		return this.ORM.knex(this._table());
	}

	/**
	 * Query this model's table and return promise that resolves to array of instances for found rows
	 * @return pending Promise
	 */
	static find() {
		return this.query().column(this.getTableColumns()).queryContext({
			ormtransform: transformQueryResults(this.model_definition, this)
		});
	}

	/**
	 * Query this model's table and return promise that resolves to instance for first found row
	 * @return pending Promise
	 */
	static findOne() {
		return this.query().limit(1).column(this.getTableColumns()).queryContext({
			ormtransform: transformQueryResults(this.model_definition, this),
			returnSingleObject: true,
		});
	}

	static count(...args) {
		const builder = this.query();
		return builder.count.apply(builder, args);

	}
	static min(...args) {
		const builder = this.query();
		return builder.min.apply(builder, args);
	}
	static max(...args) {
		const builder = this.query();
		return builder.max.apply(builder, args);

	}
	static sum(...args) {
		const builder = this.query();
		return builder.sum.apply(builder, args);

	}
	static avg(...args) {
		const builder = this.query();
		return builder.avg.apply(builder, args);
	}
	static truncate() {
		return this.query().truncate();
	}

	//@TODO figure out how to union, or does this just get offloaded to knex?  need to test to see if
	//we can call a model function inside a union callback to get the desired result
	union() { //? is this necessary to implement?

	}

	/**
	 * Query this model's table by primary key and return promise that resolves to instance
	 * @return pending Promise
	 */
	static findByPk(id) {
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
		let relationTypes = [HAS_MANY, BELONGS_TO, HAS_ONE, HAS_MANY_THROUGH, BELONGS_TO_THROUGH, HAS_ONE_THROUGH];
		relationTypes.map(relType => {
			if (isObject(def[relType])) {
				Object.keys(def[relType]).map(relationName => {
					let config = def[relType][relationName];
					if (isObject(config)) {
						if ([BELONGS_TO_THROUGH, HAS_MANY_THROUGH, HAS_ONE_THROUGH].indexOf(relType) !== -1 && config.through && config.relationship) {
							that[relationName] = () => {
								return that._doRelation(relationName, relType,  () => {
									return that["_" + relType](config.through, config.relationship);
								}
							)};
						} else if (config.model && config.key) {
							that[relationName] = () => {
								return that._doRelation(relationName, relType, () => {
									return that["_" + relType](config.model, config.key);
								}
							)};
						}
					}
				});
			}
		});
	}

	_doRelation(key, type, getFunc) {
		if (!this._id()) return relationDefault(type);
		return getFunc();
	}

	_hasMany(model, key) {
		const ORM = this.constructor.ORM;
		const modelClass = ORM.modelRegistry[model];
		if (!modelClass) {
			this.debug("Invalid model provided for hasMany relationship");
			return Promise.resolve([]);
		}
		return modelClass.find().where(modelClass.attr(key), this._id());
	}

	_belongsTo(model, key) {
		const ORM = this.constructor.ORM;
		const modelClass = ORM.modelRegistry[model];
		if (!modelClass) {
			this.debug("Invalid model provided for belongsTo relationship");
			return Promise.resolve(null);
		}
		return modelClass.findByPk(this[key]);
	}


	_hasOne(model, key) {
		const ORM = this.constructor.ORM;
		const modelClass = ORM.modelRegistry[model];
		if (!modelClass) {
			this.debug("Invalid model provided for belongsTo relationship");
			return Promise.resolve(null);
		}
		return modelClass.findOne().where(modelClass.attr(key), this._id());
	}

	_hasManyThrough(throughRelation, targetRelation) {
		const ORM = this.constructor.ORM;
		const data = ORM.getThroughRelationshipData(this.constructor.name, throughRelation, targetRelation);
		if (typeof data === 'string') {
			this.debug(data);
			return Promise.resolve([]);
		}
		const validCombinations = [`${HAS_MANY}-${HAS_MANY}`, `${HAS_ONE}-${HAS_MANY}`, `${HAS_MANY}-${HAS_ONE}`];
		if (validCombinations.indexOf(data.relationshipCombination) === -1) {
			this.debug(`Invalid relationship combination for hasManyThrough ${relationshipCombination}`);
			return Promise.resolve([]);
		}
	    return data.targetModel.find()
		.join(
			data.throughModel._table(),
			data.throughModel.attr(data.throughModel._pk()),
			'=',
			data.targetModel.attr(data.targetKey)
		)
		.join(
			this.constructor._table(),
			this.constructor.attr(this.constructor._pk()),
			'=',
			data.throughModel.attr(data.throughKey)
		)
		.where(this.constructor.attr(this.constructor._pk()), this._id());
	}

	_hasOneThrough(throughRelation, targetRelation) {
		const ORM = this.constructor.ORM;
		const data = ORM.getThroughRelationshipData(this.constructor.name, throughRelation, targetRelation);
		if (typeof data === 'string') {
			this.debug(data);
			return Promise.resolve([]);
		}
		if (data.relationshipCombination !== `${HAS_ONE}-${HAS_ONE}`) {
			this.debug(`Invalid relationship combination for hasOneThrough ${relationshipCombination}`);
			return Promise.resolve([]);
		}
	    return data.targetModel.findOne()
		.join(
			data.throughModel._table(),
			data.throughModel.attr(data.throughModel._pk()),
			'=',
			data.targetModel.attr(data.targetKey)
		)
		.join(
			this.constructor._table(),
			this.constructor.attr(this.constructor._pk()),
			'=',
			data.throughModel.attr(data.throughKey)
		)
		.where(this.constructor.attr(this.constructor._pk()), this._id());
	}

	_belongsToThrough(throughRelation, targetRelation) {
		const ORM = this.constructor.ORM;
		const data = ORM.getThroughRelationshipData(this.constructor.name, throughRelation, targetRelation);
		if (typeof data === 'string') {
			this.debug(data);
			return Promise.resolve(null);
		}

		if (data.relationshipCombination !== `${BELONGS_TO}-${BELONGS_TO}`) {
			this.debug(`Invalid relationship combination for belongsToThrough ${relationshipCombination}`);
			return Promise.resolve(null);
		}
    	return data.targetModel.findOne()
		.join(
			data.throughModel._table(),
			data.throughModel.attr(data.targetKey),
			'=',
			data.targetModel.attr(data.targetModel._pk()),
		)
		.join(
			this.constructor._table(),
			this.constructor.attr(data.throughKey),
			'=',
			data.throughModel.attr(data.throughModel._pk())
		)
		.where(this.constructor.attr(this.constructor._pk()), this._id())
	}

	static debug(message) {
		this.ORM.debug(message);
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

function getSaveValues(modelInstance) {
	let values = {};
	Object.keys(modelInstance.constructor.model_definition.attributes).map(attr => {
		if (attr != modelInstance.constructor._pk()) {
			values[attr] = modelInstance[attr];
		}
	});
	return values;
}
