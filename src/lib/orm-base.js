
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
		if (!Array.isArray(model)) model = [model];
		let that = this;
		model.map(m => {
			that.modelRegistry[m.name] = m;
		});
	}
}
