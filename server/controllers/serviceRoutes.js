const mongoose = require("mongoose");
const Service = require("../models/service");
const { StatusCode } = require("../consts/statusCode");
const responseHandler = require("../utils/responseHandler");

const allowedFields = new Set([
  "name",
  "description",
  "duration",
  "durationIsEstimated",
  "price",
  "isActive",
]);

// Estimated durations can be displayed and used for scheduling.
// A service still needs a valid duration and price before booking.
const isBookingConfigured = (service) =>
  service.isActive !== false &&
  Number.isSafeInteger(service.duration) &&
  service.duration >= 1 &&
  typeof service.price === "number" &&
  Number.isFinite(service.price) &&
  service.price >= 0;

const serializeService = (service) => {
  if (!service) {
    return null;
  }

  const record =
    typeof service.toObject === "function"
      ? service.toObject()
      : service;

  return {
    ...record,
    bookingEnabled: isBookingConfigured(record),
  };
};

const validatePayload = (
  body,
  { requireCreateFields = false } = {}
) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object.";
  }

  const keys = Object.keys(body);

  if (keys.length === 0) {
    return "Request body cannot be empty.";
  }

  const unknownFields = keys.filter(
    (key) => !allowedFields.has(key)
  );

  if (unknownFields.length > 0) {
    return `Unknown field(s): ${unknownFields.join(", ")}.`;
  }

  if (
    requireCreateFields &&
    (
      !Object.prototype.hasOwnProperty.call(body, "name") ||
      !Object.prototype.hasOwnProperty.call(body, "duration")
    )
  ) {
    return "Name and duration are required.";
  }

  if (Object.prototype.hasOwnProperty.call(body, "name")) {
    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      body.name.trim().length > 120
    ) {
      return "Name must be a non-empty string (maximum 120 characters).";
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(body, "description")
  ) {
    if (
      typeof body.description !== "string" ||
      body.description.length > 2000
    ) {
      return "Description must be text (maximum 2000 characters).";
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "duration")) {
    if (
      !Number.isSafeInteger(body.duration) ||
      body.duration < 1
    ) {
      return "Duration must be a positive whole number of minutes.";
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "durationIsEstimated"
    ) &&
    typeof body.durationIsEstimated !== "boolean"
  ) {
    return "durationIsEstimated must be a boolean.";
  }

  if (
    Object.prototype.hasOwnProperty.call(body, "price") &&
    body.price !== null &&
    body.price !== ""
  ) {
    if (
      typeof body.price !== "number" ||
      !Number.isFinite(body.price) ||
      body.price < 0
    ) {
      return "Price must be a finite, non-negative number.";
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "isActive")) {
    if (typeof body.isActive !== "boolean") {
      return "isActive must be a boolean.";
    }
  }

  return null;
};

const handleError = (res, error, operation) => {
  if (error.code === 11000) {
    return responseHandler(
      res,
      StatusCode.CONFLICT,
      "A duplicate service already exists."
    );
  }

  if (
    error.name === "ValidationError" ||
    error.name === "CastError" ||
    error instanceof mongoose.Error
  ) {
    return responseHandler(
      res,
      StatusCode.BAD_REQUEST,
      error.message
    );
  }

  console.error(`${operation} error:`, error);

  return responseHandler(
    res,
    StatusCode.SERVER_ERROR,
    "An internal server error occurred."
  );
};

/* -------------------------------------------------------------------------- */
/*                              Create Service                                */
/* -------------------------------------------------------------------------- */

const createService = async (req, res) => {
  try {
    const validationError = validatePayload(req.body, {
      requireCreateFields: true,
    });

    if (validationError) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        validationError
      );
    }

    const payload = {
      ...req.body,
      name: req.body.name.trim(),
      description:
        typeof req.body.description === "string"
          ? req.body.description.trim()
          : "",
      price:
        req.body.price === "" ||
        req.body.price === undefined
          ? null
          : req.body.price,
    };

    const service = await Service.create(payload);

    return responseHandler(
      res,
      StatusCode.INSERTED,
      "Service created successfully.",
      {
        service: serializeService(service),
      }
    );
  } catch (error) {
    return handleError(res, error, "Create service");
  }
};

/* -------------------------------------------------------------------------- */
/*                              Get All Services                              */
/* -------------------------------------------------------------------------- */

const getServices = async (req, res) => {
  try {
    const services = await Service.find({
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();

    return responseHandler(
      res,
      StatusCode.SUCCESS,
      "Services retrieved successfully.",
      services.map(serializeService)
    );
  } catch (error) {
    return handleError(res, error, "Get services");
  }
};

/* -------------------------------------------------------------------------- */
/*                              Get Service By ID                             */
/* -------------------------------------------------------------------------- */

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Invalid service ID."
      );
    }

    const service = await Service.findOne({
      _id: id,
      isActive: true,
    }).lean();

    if (!service) {
      return responseHandler(
        res,
        StatusCode.NOT_FOUND,
        "Active service not found."
      );
    }

    return responseHandler(
      res,
      StatusCode.SUCCESS,
      "Service retrieved successfully.",
      serializeService(service)
    );
  } catch (error) {
    return handleError(res, error, "Get service");
  }
};

/* -------------------------------------------------------------------------- */
/*                              Update Service                                */
/* -------------------------------------------------------------------------- */

const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Invalid service ID."
      );
    }

    const validationError = validatePayload(req.body);

    if (validationError) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        validationError
      );
    }

    const updates = {
      ...req.body,
    };

    if (
      Object.prototype.hasOwnProperty.call(updates, "price") &&
      updates.price === ""
    ) {
      updates.price = null;
    }

    if (typeof updates.name === "string") {
      updates.name = updates.name.trim();
    }

    if (typeof updates.description === "string") {
      updates.description = updates.description.trim();
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
      return responseHandler(
        res,
        StatusCode.NOT_FOUND,
        "Service not found."
      );
    }

    return responseHandler(
      res,
      StatusCode.SUCCESS,
      "Service updated successfully.",
      serializeService(service)
    );
  } catch (error) {
    return handleError(res, error, "Update service");
  }
};

/* -------------------------------------------------------------------------- */
/*                              Delete Service                                */
/* -------------------------------------------------------------------------- */

// Soft-delete: keeps existing appointment references intact.
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return responseHandler(
        res,
        StatusCode.BAD_REQUEST,
        "Invalid service ID."
      );
    }

    const service = await Service.findOneAndUpdate(
      {
        _id: id,
        isActive: true,
      },
      {
        $set: {
          isActive: false,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!service) {
      return responseHandler(
        res,
        StatusCode.NOT_FOUND,
        "Active service not found."
      );
    }

    return responseHandler(
      res,
      StatusCode.SUCCESS,
      "Service deactivated successfully.",
      serializeService(service)
    );
  } catch (error) {
    return handleError(res, error, "Delete service");
  }
};

/* -------------------------------------------------------------------------- */
/*                                  Exports                                   */
/* -------------------------------------------------------------------------- */

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
};