export const getPropFromObject = (prop, object) => {
	if (typeof object === 'object' && typeof object[prop] !== 'undefined') {
		return object[prop];
	}
	return null;
}
