export default {
	table: "pet_owner",
	attributes: {
		id: null,
		name: null,
	},
	hasMany: {
		cats: {model: "Cat", key: "pet_owner_id"},
	},
	hasManyThrough: {
		catToys: {through: 'cats', relationship: "catToys"},
		collars: {through: 'cats', relationship: "collar"},
	}
};
