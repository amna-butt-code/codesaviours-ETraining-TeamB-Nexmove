const mongoose = require("mongoose");
const Patient = require("../models/patient");
const Appointment = require("../models/appointment");

const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // Resolve the authenticated User to their Patient profile.
    const patient = await Patient.findOne({ user: userId })
      .select("_id")
      .lean();

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found. Please contact the clinic.",
      });
    }

    // Never accept a patient ID from the request.
    const appointments = await Appointment.find({
      patient: patient._id,
    })
      .select(
        "_id appointmentDate appointmentEnd status service therapist createdAt"
      )
      .sort({ appointmentDate: -1 })
      .lean();

    return res.status(200).json({
      message: "Appointments retrieved successfully.",
      data: appointments,
    });
  } catch (error) {
    console.error("Get patient appointments error:", error);

    return res.status(500).json({
      message: "Unable to retrieve your appointments.",
    });
  }
};

module.exports = { getMyAppointments };
