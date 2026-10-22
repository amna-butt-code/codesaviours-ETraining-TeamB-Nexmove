const mongoose = require("mongoose");

const therapistSchema = new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            unique: true,
            sparse: true,
        },
        name:{
            type:String,
            required:true,
            trim:true
        },
        qualification:{
            type:[String],
            required:true,
            default:[],
        },
        specialties: {
            type: [String],
            default: []
        },
        availability: {
            type:[String],
            default:[],
        },
        inactive:{
            type:Boolean,
            default:true
        }

    },
    {timestamps:true}
);


      module.exports = mongoose.model("Therapist", therapistSchema);