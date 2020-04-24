export default {
	table: "tag",
	attributes: {
		id: {},
		collar_id: {},
		message: {},
	},
	belongsTo: {
		collar: {model: "Collar", key: "collar_id"},
	}
};
