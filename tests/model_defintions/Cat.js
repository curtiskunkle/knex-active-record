export default {
	table: "cat",
	attributes: {
		id: {},
		pet_owner_id: {},
		name: {},
		breed: {},
	},
	belongsTo: {
		owner: {model: "PetOwner", key: "pet_owner_id"}
	},
	hasMany: {
		catToys: {model: "CatToy", key: "cat_id"},
	},
	hasOne: {
		collar: {model: "Collar", key: "cat_id"},
	},
	hasOneThrough: {
		leash: {through: "collar", relationship: "leash"}
	},
	hasManyThrough: {
		tags: {through: 'collar', relationship: "tags"},
	}
};
