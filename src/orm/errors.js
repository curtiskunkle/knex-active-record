export class MissingRequiredAttributeError extends Error {
	constructor(modelInstance, attributeName) {
		super(`${modelInstance.constructor.name} missing required attribute [${attributeName}]`);
	    this.name = "MissingRequiredAttributeError";
	}
}

export class InvalidAttributeError extends Error {
	constructor(modelInstance, attributeName) {
		super(`${modelInstance.constructor.name} [${attributeName}] attribute failed validation`);
	    this.name = "InvalidAttributeError";
	}
}

export class InvalidInstanceError extends Error {
	constructor(modelInstance) {
		super(`${modelInstance.constructor.name} failed validation`);
	    this.name = "InvalidInstanceError";
	}
}

export class InvalidModelError extends Error {
	constructor(message) {
		super(message);
	    this.name = "InvalidModelError";
	}
}