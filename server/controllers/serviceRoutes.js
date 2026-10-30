
const mongoose = require("mongoose");
const Service = require("../models/service");

const isBookingConfigured = (service) =>
  Number.isSafeInteger(service.duration) &&
  service.duration >= 1 &&
  typeof service.price === "number" &&
  Number.isFinite(service.price) &&
  service.price >= 0;

const serializeService = (service) => {
  const record =
    typeof service.toObject === "function"
      ? service.toObject()
      : service;

  return {
    ...record,
    bookingEnabled: isBookingConfigured(record),
  };
};

const createService = async (req, res) => {
  try {
    const body = req.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({
        message: "A valid service object is required.",
      });
    }

    const { name, description = "", duration, price } = body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 120
    ) {
      return res.status(400).json({
        message: "A valid service name is required (maximum 120 characters).",
      });
    }

    if (
      typeof description !== "string" ||
      description.length > 2000
    ) {
      return res.status(400).json({
        message: "Description must be text with a maximum of 2000 characters.",
      });
    }

    if (!Number.isSafeInteger(duration) || duration < 1) {
      return res.status(400).json({
        message: "Duration must be a whole number of at least 1 minute.",
      });
    }

    if (
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return res.status(400).json({
        message: "Price must be a valid non-negative number.",
      });
    }

    const service = await Service.create({
      name: name.trim(),
      description: description.trim(),
      duration,
      price,
    });

    return res.status(201).json({
      message: "Service created successfully.",
      service: serializeService(service),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Create service error:", error.message);

    return res.status(500).json({
      message: "Unable to create service.",
    });
  }
};

const getServices = async (req, res) => {
  try {
    const services = await Service.find({
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();

    return res.status(200).json(
      services.map(serializeService)
    );
  } catch (error) {
    console.error("Get services error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve services.",
    });
  }
};

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid service ID.",
      });
    }

    const service = await Service.findOne({
      _id: id,
      isActive: true,
    }).lean();

    if (!service) {
      return res.status(404).json({
        message: "Service not found.",
      });
    }

    return res.status(200).json(
      serializeService(service)
    );
  } catch (error) {
    console.error("Get service error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve service.",
    });
  }
};

// Admin-only partial update.
// Useful for configuring existing services after clinic approval.
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid service ID.",
      });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({
        message: "A valid update object is required.",
      });
    }

    const allowedFields = [
      "name",
      "description",
      "duration",
      "price",
      "isActive",
    ];

    const unknownFields = Object.keys(body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unknownFields.length > 0) {
      return res.status(400).json({
        message: `Unsupported fields: ${unknownFields.join(", ")}`,
      });
    }

    const updates = {};

    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      if (
        typeof body.name !== "string" ||
        !body.name.trim() ||
        body.name.trim().length > 120
      ) {
        return res.status(400).json({
          message: "Please provide a valid service name.",
        });
      }

      updates.name = body.name.trim();
    }

    if (Object.prototype.hasOwnProperty.call(body, "description")) {
      if (
        typeof body.description !== "string" ||
        body.description.length > 2000
      ) {
        return res.status(400).json({
          message: "Description must be text with a maximum of 2000 characters.",
        });
      }

      updates.description = body.description.trim();
    }

    if (Object.prototype.hasOwnProperty.call(body, "duration")) {
      if (
        !Number.isSafeInteger(body.duration) ||
        body.duration < 1
      ) {
        return res.status(400).json({
          message: "Duration must be a whole number of at least 1 minute.",
        });
      }

      updates.duration = body.duration;
    }

    if (Object.prototype.hasOwnProperty.call(body, "price")) {
      if (
        typeof body.price !== "number" ||
        !Number.isFinite(body.price) ||
        body.price < 0
      ) {
        return res.status(400).json({
          message: "Price must be a valid non-negative number.",
        });
      }

      updates.price = body.price;
    }

    if (Object.prototype.hasOwnProperty.call(body, "isActive")) {
      if (typeof body.isActive !== "boolean") {
        return res.status(400).json({
          message: "isActive must be a boolean.",
        });
      }

      updates.isActive = body.isActive;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "At least one valid field must be provided.",
      });
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!service) {
      return res.status(404).json({
        message: "Service not found.",
      });
    }

    return res.status(200).json({
      message: "Service updated successfully.",
      service: serializeService(service),
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Update service error:", error.message);

    return res.status(500).json({
      message: "Unable to update service.",
    });
  }
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
};
