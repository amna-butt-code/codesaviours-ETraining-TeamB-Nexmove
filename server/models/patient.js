const mongoose = require("mongoose");


const patientSchema = new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        dateOfBirth: {
            type: Date,
        },
        address: {
            type: String,
            trim: true,
       },
},
 {timestamps: true,}
);


    module.exports = mongoose.model("Patient", patientSchema);