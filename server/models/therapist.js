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
qualification: {
    type: [String],
    default: [],
},
        specialties: {
            type: [String],
            default: []
        },
        availability: {
            type: [
        {
            dayOfWeek: {
                type: Number,
                required: true,
                min: 0,
                max: 6,
            },
            startTime: {
                type: String,
                required: true,
                match: /^([01]\d|2[0-3]):[0-5]\d$/,
            },
            endTime: {
                type: String,
                required: true,
                match: /^([01]\d|2[0-3]):[0-5]\d$/,
            },
        },
    ],
    default: [],
},

        inactive:{
            type:Boolean,
            default:false
        },
        profileImage:{
            type:String,
            default:"",
            trim:true
        }

    },
    {timestamps:true}
);


      module.exports = mongoose.model("Therapist", therapistSchema);