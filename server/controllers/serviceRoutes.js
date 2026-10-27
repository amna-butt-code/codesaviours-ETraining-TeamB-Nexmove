const mongoose = require("mongoose");
const Service = require("../models/service");

const allowedFields = new Set([
  "name",
  "description",
  "duration",
  "price",
  "isActive",
]);

const validatePayload = (body, allowEmpty = false) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object.";
  }

  const keys = Object.keys(body);

  if (!allowEmpty && keys.length === 0) {
    return "Request body cannot be empty.";
  }

  const unknown = keys.filter((key) => !allowedFields.has(key));

  if (unknown.length) {
    return `Unknown field(s): ${unknown.join(", ")}.`;
  }

  if ("name" in body &&
      (typeof body.name !== "string" || !body.name.trim())) {
    return "Name must be a non-empty string.";
  }

  if ("description" in body &&
      typeof body.description !== "string") {
    return "Description must be a string.";
  }

  if ("duration" in body &&
      (!Number.isInteger(body.duration) || body.duration < 1)) {
    return "Duration must be a positive integer.";
  }

  if ("price" in body &&
      (typeof body.price !== "number" ||
       !Number.isFinite(body.price) ||
       body.price < 0)) {
    return "Price must be a non-negative number.";
  }

  if ("isActive" in body && typeof body.isActive !== "boolean") {
    return "isActive must be a boolean.";
  }

  return null;
};

const handleError = (res, error) => {
  if (
    error.name === "ValidationError" ||
    error.name === "CastError" ||
    error instanceof mongoose.Error
  ) {
    return res.status(400).json({ message: error.message });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: "A duplicate service already exists." });
  }

  console.error("Service API error:", error);
  return res.status(500).json({ message: "Internal server error." });
};

const createService = async (req, res) => {
  try {
    const validationError = validatePayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const payload = { ...req.body };

    if (typeof payload.name === "string") {
      payload.name = payload.name.trim();
    }

    if (typeof payload.description === "string") {
      payload.description = payload.description.trim();
    }

    const service = await Service.create(payload);

    return res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });

    return res.status(200).json(services);
  } catch (error) {
    return handleError(res, error);
  }
};

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid service ID." });
    }

    const service = await Service.findOne({
      _id: id,
      isActive: true,
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }

    return res.status(200).json(service);
  } catch (error) {
    return handleError(res, error);
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid service ID." });
    }

    const validationError = validatePayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const update = { ...req.body };

    if (typeof update.name === "string") {
      update.name = update.name.trim();
    }

    if (typeof update.description === "string") {
      update.description = update.description.trim();
    }

    const service = await Service.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: "Active service not found." });
    }

    return res.status(200).json({
      message: "Service updated successfully.",
      service,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid service ID." });
    }

    const service = await Service.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: { isActive: false } },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: "Active service not found." });
    }

    return res.status(200).json({
      message: "Service deactivated successfully.",
      service,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
};
