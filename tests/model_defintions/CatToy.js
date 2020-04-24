export default {
	table: "cat_toy",
	attributes: {
		id: {},
		cat_id: {},
		name: {},
		contains_catnip: {},
	},
	belongsTo: {
		cat: {model: "Cat", key: "cat_id"},
	}
};
