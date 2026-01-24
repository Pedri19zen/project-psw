const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		brand: {
			type: String,
			required: true,
			trim: true,
		},
		model: {
			type: String,
			required: true,
			trim: true,
		},
		plate: {
			type: String,
			required: true,
			unique: true,
			uppercase: true,
			trim: true,
		},
		year: {
			type: Number,
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
