export default {
	table: "leash",
	attributes: {
		id: {},
		collar_id: {},
		color: {},
	},
	belongsTo: {
		collar: {model: "Collar", key: "collar_id"},
	},
};
