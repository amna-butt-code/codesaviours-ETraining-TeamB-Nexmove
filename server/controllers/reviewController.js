const mongoose = require("mongoose");
const Patient = require("../models/patient");
const Appointment = require("../models/appointment");
const Review = require("../models/Review");
const { StatusCode } = require("../consts/statusCode");
const responseHandler = require("../utils/responseHandler");
const { classifySentiment } = require("../utils/sentimentAnalysis");

const listApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ approved: true })
      .select("rating text sentiment createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return responseHandler(res, StatusCode.SUCCESS, "Approved reviews retrieved successfully.", reviews);
  } catch (error) {
    console.error("List reviews error:", error.message);
    return responseHandler(res, StatusCode.SERVER_ERROR, "Unable to retrieve reviews.");
  }
};

const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, text } = req.body || {};
    const userId = req.user?._id || req.user?.id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return responseHandler(res, StatusCode.UNAUTHORIZED, "Please log in to submit a review.");
    }

    if (!mongoose.isValidObjectId(appointmentId)) {
      return responseHandler(res, StatusCode.BAD_REQUEST, "A valid appointment ID is required.");
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return responseHandler(res, StatusCode.BAD_REQUEST, "Rating must be a whole number from 1 to 5.");
    }

    if (typeof text !== "string" || text.trim().length < 10 || text.trim().length > 1000) {
      return responseHandler(res, StatusCode.BAD_REQUEST, "Review text must be between 10 and 1000 characters.");
    }

    const patient = await Patient.findOne({ user: userId }).select("_id");
    if (!patient) {
      return responseHandler(res, StatusCode.NOT_FOUND, "Patient profile not found.");
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: patient._id,
      status: "completed",
    }).select("_id");

    if (!appointment) {
      return responseHandler(res, StatusCode.BAD_REQUEST, "Reviews can only be submitted for your own completed appointments.");
    }

    const review = await Review.create({
      patient: patient._id,
      appointment: appointment._id,
      rating,
      text: text.trim(),
      sentiment: classifySentiment(text),
      approved: false,
    });

    return responseHandler(res, StatusCode.INSERTED, "Review submitted for moderation.", {
      id: review._id,
      rating: review.rating,
      sentiment: review.sentiment,
      approved: review.approved,
    });
  } catch (error) {
    if (error.code === 11000) {
      return responseHandler(res, StatusCode.CONFLICT, "A review has already been submitted for this appointment.");
    }
    if (error.name === "ValidationError") {
      return responseHandler(res, StatusCode.BAD_REQUEST, "Review data is invalid.");
    }
    console.error("Create review error:", error.message);
    return responseHandler(res, StatusCode.SERVER_ERROR, "Unable to submit review.");
  }
};

const approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return responseHandler(res, StatusCode.BAD_REQUEST, "A valid review ID is required.");
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { approved: true },
      { new: true, runValidators: true }
    ).select("rating text sentiment approved createdAt");

    if (!review) {
      return responseHandler(res, StatusCode.NOT_FOUND, "Review not found.");
    }

    return responseHandler(res, StatusCode.SUCCESS, "Review approved successfully.", review);
  } catch (error) {
    console.error("Approve review error:", error.message);
    return responseHandler(res, StatusCode.SERVER_ERROR, "Unable to approve review.");
  }
};

module.exports = { listApprovedReviews, createReview, approveReview };
