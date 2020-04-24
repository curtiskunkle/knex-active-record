export class MissingRequiredAttributeError extends Error {
	constructor(modelInstance, attributeName) {
	    this.message = `${modelInstance.constructor.name} missing required attribute [${attributeName}]`;
	    this.name = "MissingRequiredAttributeError";
	}
}

export class InvalidAttributeError extends Error {
	constructor(modelInstance, attributeName) {
	    this.message = `${modelInstance.constructor.name} [${attributeName}] attribute failed validation`;
	    this.name = "InvalidAttributeError";
	}
}

export class InavlidInstanceError extends Error {
	constructor(modelInstance) {
	    this.message = `${modelInstance.constructor.name} failed validation`;
	    this.name = "InavlidInstanceError";
	}
}
