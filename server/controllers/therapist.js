
const mongoose = require("mongoose");
const Therapist = require("../models/therapist");
const { StatusCode } = require("../consts/statusCode");
const responseHandler = require("../utils/responseHandler");

function isStringArray(value) {
    return (
        Array.isArray(value) &&
        value.every(
            (item) =>
                typeof item === "string" &&
                item.trim().length > 0
        )
    );
}

const createTherapist = async (req, res) => {
    try {
        const body = req.body || {};

        const {
            user,
            name,
            qualification = [],
            specialties = [],
            availability = [],
            profileImage = "",
        } = body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            !Array.isArray(qualification)
        ) {
            return responseHandler(
                res,
                StatusCode.BAD_REQUEST,
                "A valid name and qualification array are required."
            );
        }

        if (
            !isStringArray(qualification) ||
            !isStringArray(specialties) ||
            !Array.isArray(availability)
        ) {
            return responseHandler(
                res,
                StatusCode.BAD_REQUEST,
                "Qualifications and specialties must be arrays of non-empty strings, and availability must be an array."
            );
        }

        if (
            typeof profileImage !== "string" ||
            profileImage.length > 2048
        ) {
            return responseHandler(
                res,
                StatusCode.BAD_REQUEST,
                "Profile image must be a valid string."
            );
        }

        const normalizedUser =
            user === undefined || user === null || user === ""
                ? undefined
                : user;

        if (
            normalizedUser &&
            !mongoose.isValidObjectId(normalizedUser)
        ) {
            return responseHandler(
                res,
                StatusCode.BAD_REQUEST,
                "Invalid user ID."
            );
        }

        if (normalizedUser) {
            const existingTherapist = await Therapist.findOne({
                user: normalizedUser,
            });

            if (existingTherapist) {
                return responseHandler(
                    res,
                    StatusCode.ALREADY_EXIST,
                    "A therapist profile already exists for this user."
                );
            }
        }

        const therapist = await Therapist.create({
            user: normalizedUser,
            name: name.trim(),
            qualification: qualification.map((item) => item.trim()),
            specialties: specialties.map((item) => item.trim()),
            availability,
            profileImage: profileImage.trim(),
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

        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
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
        const therapists = await Therapist.find().sort({
            createdAt: -1,
        });

        return responseHandler(
            res,
            StatusCode.SUCCESS,
            "Therapists retrieved successfully.",
            {
                count: therapists.length,
                therapists,
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

module.exports = {
    createTherapist,
    getTherapists,
};
