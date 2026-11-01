
const mongoose = require("mongoose");
const Therapist = require("../models/therapist");
const { StatusCode } = require("../consts/statusCode");
const responseHandler = require("../utils/responseHandler");

const createTherapist = async (req, res) => {
    try {
        const {
            user,
            name,
            qualification,
            specialties = [],
            availability = [],
            profileImage = ""
        } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            !Array.isArray(qualification) ||
            qualification.length === 0
        ) {
            return responseHandler(
                res,
                StatusCode.BAD_REQUEST,
                "Name and at least one qualification are required."
            );
        }

        if (
            !Array.isArray(specialties) ||
            !Array.isArray(availability)
        ) {
            return responseHandler(
                res,
                StatusCode.BAD_REQUEST,
                "Specialties and availability must be arrays."
            );
        }

        if (user && !mongoose.isValidObjectId(user)) {
            return responseHandler(
                res,
                StatusCode.BAD_REQUEST,
                "Invalid user ID."
            );
        }

        if (user) {
            const existingTherapist = await Therapist.findOne({ user });

            if (existingTherapist) {
                return responseHandler(
                    res,
                    StatusCode.ALREADY_EXIST,
                    "A therapist profile already exists for this user."
                );
            }
        }

        const therapist = await Therapist.create({
            user: user || undefined,
            name: name.trim(),
            qualification,
            specialties,
            availability,
            profileImage
        });

        return responseHandler(
            res,
            StatusCode.INSERTED,
            "Therapist created successfully.",
            { therapist }
        );
    } catch (error) {
        console.error("Create therapist error:", error);

        if (error.code === 11000) {
            return responseHandler(
                res,
                StatusCode.ALREADY_EXIST,
                "A therapist profile already exists for this user."
            );
        }

        if (error.name === "ValidationError" || error.name === "CastError") {
            return responseHandler(
                res,
                StatusCode.BAD_REQUEST,
                "Invalid therapist data."
            );
        }

        return responseHandler(
            res,
            StatusCode.SERVER_ERROR,
            "Failed to create therapist."
        );
    }
};

const getTherapists = async (req, res) => {
    try {
        const therapists = await Therapist.find().sort({ createdAt: -1 });

        return responseHandler(
            res,
            StatusCode.SUCCESS,
            "Therapists retrieved successfully.",
            {
                count: therapists.length,
                therapists
            }
        );
    } catch (error) {
        console.error("Get therapists error:", error);

        return responseHandler(
            res,
            StatusCode.SERVER_ERROR,
            "Failed to retrieve therapists."
        );
    }
};


const updateTherapist = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return responseHandler(res,StatusCode.BAD_REQUEST,"Invalid therapist ID.");
        }

        const allowedFields = ["name", "qualification", "specialties", "availability", "inactive", "profileImage"];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return responseHandler(res,StatusCode.BAD_REQUEST,"No valid fields provided for update.");
        }

        const therapist = await Therapist.findByIdAndUpdate(
            id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!therapist) {
            return responseHandler(res,  StatusCode.NOT_FOUND,  "Therapist not found.");
        }

        return responseHandler(res,StatusCode.SUCCESS,"Therapist updated successfully.",
            {
                 therapist 
                }
        );
    } catch (error) {

        return responseHandler(res,StatusCode.BAD_REQUEST,"Failed to update therapist. Please check the provided data.");
    }
};

const deleteTherapist = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return responseHandler(res,StatusCode.BAD_REQUEST,"Invalid therapist ID.");
        }

        const therapist = await Therapist.findByIdAndDelete(id);

        if (!therapist) {
            return responseHandler(res,StatusCode.NOT_FOUND,"Therapist not found.");
        }

        return responseHandler(res,StatusCode.SUCCESS,"Therapist deleted successfully.");
    } catch (error) {
        console.error("Delete therapist error:", error);

        return responseHandler(res,StatusCode.SERVER_ERROR,"Failed to delete therapist.");
    }
};


module.exports = {createTherapist,getTherapists,updateTherapist,deleteTherapist};
