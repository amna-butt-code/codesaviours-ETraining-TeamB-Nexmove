const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    passwordResetTokenHash: {
    type: String,
    select: false
    },
    passwordResetExpires: {
    type: Date,
    select: false
    },
    role:{
        type: String,
        enum: ['patient', 'therapist','admin'],
        default: 'patient'
    }
}, { timestamps: true
});

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);