export const getPropFromObject = (prop, object) => {
	if (isObject(object) && typeof object[prop] !== 'undefined') {
		return object[prop];
	}
	return null;
}

export const isObject = obj => {
	return typeof obj === 'object' && obj !== null;
}
