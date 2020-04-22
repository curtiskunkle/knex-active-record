import { isObject } from '../helpers';
import { BELONGS_TO, HAS_MANY, HAS_ONE, HAS_MANY_THROUGH } from './constants';

export default class ORMBase {

	constructor(config) {
		this.modelRegistry = {};
		this.knex = null;
		this.init(config);
	}

	init (config) {
		this.knex = require('knex')({
			...config,
		  	postProcessResponse: (result, queryContext) => {
		  		if (typeof queryContext === 'object' && typeof queryContext.ormtransform === 'function') {
		  			const transformed = queryContext.ormtransform(result);
		  			if (queryContext.returnSingleObject) {
		  				return transformed.length ? transformed[0] : null;
		  			}
		  			return transformed;
		  		}
		  		return result;
		  	}
		});
	}

	register (model) {
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
}
