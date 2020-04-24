export default {
	table: "collar",
	attributes: {
		id: {},
		cat_id: {},
		color: {},
	},
	belongsTo: {
		cat: {model: "Cat", key: "cat_id"},
	},
	belongsToThrough: {
		owner: {through: "cat", relationship: "owner"},
	},
	hasMany: {
		tags: {model: "Tag", key: "collar_id"}
	},
	hasOne: {
		leash: {model: "Leash", key: "collar_id"}
	}
};
