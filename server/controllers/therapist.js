
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
      displayTiming = "",
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
      typeof displayTiming !== "string" ||
      displayTiming.length > 100
    ) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Display timing must be a string of no more than 100 characters."
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
      displayTiming: displayTiming.trim(),
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

// Admin-only partial update. Only explicitly supported profile fields
// can be changed through this endpoint.
const updateTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Invalid therapist ID."
      );
    }

    const allowedFields = [
      "name",
      "qualification",
      "specialties",
      "displayTiming",
      "profileImage",
    ];

    const suppliedFields = Object.keys(body);

    if (
      suppliedFields.length === 0 ||
      suppliedFields.some((field) => !allowedFields.includes(field))
    ) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Provide valid therapist profile fields to update."
      );
    }

    const updates = {};

    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return responseHandler(
          res,
          StatusCode.BAD_REQUEST,
          "Therapist name must be a non-empty string."
        );
      }

      updates.name = body.name.trim();
    }

    if (
      Object.prototype.hasOwnProperty.call(body, "qualification")
    ) {
      if (!isStringArray(body.qualification)) {
        return responseHandler(
          res,
          StatusCode.BAD_REQUEST,
          "Qualifications must be an array of non-empty strings."
        );
      }

      updates.qualification = body.qualification.map((item) =>
        item.trim()
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(body, "specialties")
    ) {
      if (!isStringArray(body.specialties)) {
        return responseHandler(
          res,
          StatusCode.BAD_REQUEST,
          "Specialties must be an array of non-empty strings."
        );
      }

      updates.specialties = body.specialties.map((item) =>
        item.trim()
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(body, "displayTiming")
    ) {
      if (
        typeof body.displayTiming !== "string" ||
        body.displayTiming.length > 100
      ) {
        return responseHandler(
          res,
          StatusCode.BAD_REQUEST,
          "Display timing must be a string of no more than 100 characters."
        );
      }

      updates.displayTiming = body.displayTiming.trim();
    }

    if (
      Object.prototype.hasOwnProperty.call(body, "profileImage")
    ) {
      if (
        typeof body.profileImage !== "string" ||
        body.profileImage.length > 2048
      ) {
        return responseHandler(
          res,
          StatusCode.BAD_REQUEST,
          "Profile image must be a valid string."
        );
      }

      updates.profileImage = body.profileImage.trim();
    }

    const therapist = await Therapist.findById(id);

    if (!therapist) {
      return responseHandler(
        res,
        StatusCode.NOT_FOUND,
        "Therapist profile not found."
      );
    }

    therapist.set(updates);
    await therapist.save();

    return responseHandler(
      res,
      StatusCode.SUCCESS,
      "Therapist profile updated successfully.",
      { therapist }
    );
  } catch (error) {
    console.error("Update therapist error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Invalid therapist profile data."
      );
    }

    return responseHandler(
      res,
      StatusCode.SERVER_ERROR,
      "Failed to update therapist profile."
    );
  }
};

module.exports = {
  createTherapist,
  getTherapists,
  updateTherapist,
};
