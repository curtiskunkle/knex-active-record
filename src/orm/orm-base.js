import { isObject } from '../helpers';
import { BELONGS_TO, HAS_MANY, HAS_ONE, HAS_MANY_THROUGH } from './constants';

export default class ORMBase {

	constructor(config) {
		this.modelRegistry = {};
		this.knex = null;
		this.debugMode = false;
		this.init(config);
	}

	init (config) {
		this.knex = require('knex')({
			...config,
		  	postProcessResponse: this.processResponse
		});
	}

	processResponse(result, queryContext) {
  		if (isObject(queryContext) && typeof queryContext.ormtransform === 'function') {
  			const transformed = queryContext.ormtransform(result);
  			if (queryContext.returnSingleObject) {
  				return transformed.length ? transformed[0] : null;
  			}
  			return transformed;
  		}
  		return result;
  	}

	registerModel (model) {
		//@TODO validate model here
		//make sure it extends model
		//validate model_defintion
		this.modelRegistry[model.name] = model;
	}

	getThroughRelationshipData(parentModel, throughRelation, targetRelation) {
		let result = {
			throughRelationshipType: null,
			throughModel: null,
			throughKey: null,
			targetRelationshipType: null,
			targetModel: null,
			targetKey: null,
		};
		if (!this.modelRegistry[parentModel]) return "Invalid parent model";
		const model_definition = this.modelRegistry[parentModel].model_definition;
		const relTypes = [BELONGS_TO, HAS_MANY, HAS_ONE];
		relTypes.map(relType => {
			if (isObject(model_definition[relType])) {
				const relKeys = Object.keys(model_definition[relType]);
				if (relKeys.indexOf(throughRelation) !== -1) {
					result.throughRelationshipType = relType;
					result.throughModel = model_definition[relType][throughRelation].model;
					result.throughKey = model_definition[relType][throughRelation].key;
				}
			}
		});
		if (!result.throughModel) return `Invalid through relation [${throughRelation}]`;
		if (!this.modelRegistry[result.throughModel]) return `Invalid through model [${result.throughModel}]`;
		result.throughModel = this.modelRegistry[result.throughModel];
		const target_model_definition = result.throughModel.model_definition;
		relTypes.map(relType => {
			if (isObject(target_model_definition[relType])) {
				const relKeys = Object.keys(target_model_definition[relType]);
				if (relKeys.indexOf(targetRelation) !== -1) {
					result.targetRelationshipType = relType;
					result.targetModel = target_model_definition[relType][targetRelation].model;
					result.targetKey = target_model_definition[relType][targetRelation].key;
				}
			}
		});
		if (!result.targetModel) return `Invalid target relation [${targetRelation}]`;
		if (!this.modelRegistry[result.targetModel]) return `Invalid target model [${result.targetModel}]`;
		result.targetModel = this.modelRegistry[result.targetModel];
		result.relationshipCombination = result.throughRelationshipType + '-' + result.targetRelationshipType;
		return result;
	}

	debug(error) {
		if (this.debugMode) {
			this._debug(error);
		}
	}
	_debug(error) {
		console.log(error);
	}

	async saveAll(modelInstances, transaction = null) {
		if (Array.isArray(modelInstances)) {
			if (transaction) {
				await _saveAll(this, modelInstances, transaction);
			} else {
				await this.knex.transaction(async trx => {
					await _saveAll(this, modelInstances, trx);
					await trx.commit();
				});
			}
		}
	}

	async deleteAll(modelInstances, transaction = null) {
		if (Array.isArray(modelInstances)) {
			if (transaction) {
				await _deleteAll(this, modelInstances, transaction);
			} else {
				await this.knex.transaction(async trx => {
					await _deleteAll(this, modelInstances, trx);
					await trx.commit();
				});
			}
		}
	}

	isModelInstance(modelInstance) {
		return isObject(modelInstance) && modelInstance.constructor.prototype instanceof this.Model;
	}

	transaction(callback) {
		return this.knex.transaction(trx => {callback(trx);});
	}
}

async function _saveAll(ORM, modelInstances, transaction) {
	for (let i = 0; i < modelInstances.length; i++) {
		if (ORM.isModelInstance(modelInstances[i])) {
			await modelInstances[i].save(transaction);
		}
	}
}

async function _deleteAll(ORM, modelInstances, transaction) {
	for (let i = 0; i < modelInstances.length; i++) {
		if (ORM.isModelInstance(modelInstances[i])) {
			await modelInstances[i].delete(transaction);
		}
	}
}
