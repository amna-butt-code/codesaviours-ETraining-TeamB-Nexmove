
const mongoose = require("mongoose");
const Service = require("../models/service");

const allowedFields = new Set([
    "name",
    "description",
    "duration",
    "durationIsEstimated",
    "price",
    "isActive",
]);

// Estimated durations are allowed for scheduling.
// Booking requires a valid duration, configured price and active service.
const isBookingConfigured = (service) =>
    service.isActive !== false &&
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

    if (Object.prototype.hasOwnProperty.call(body, "description")) {
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
        Object.prototype.hasOwnProperty.call(body, "durationIsEstimated") &&
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
        return res.status(409).json({
            message: "A duplicate service already exists.",
        });
    }

    if (
        error.name === "ValidationError" ||
        error.name === "CastError" ||
        error instanceof mongoose.Error
    ) {
        return res.status(400).json({
            message: error.message,
        });
    }

    console.error(`${operation} error:`, error);

    return res.status(500).json({
        message: "An internal server error occurred.",
    });
};

// Create a service
const createService = async (req, res) => {
    try {
        const validationError = validatePayload(req.body, {
            requireCreateFields: true,
        });

        if (validationError) {
            return res.status(400).json({
                message: validationError,
            });
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

        return res.status(201).json({
            message: "Service created successfully.",
            service: serializeService(service),
        });
    } catch (error) {
        return handleError(res, error, "Create service");
    }
};

// Retrieve all active services
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
        return handleError(res, error, "Get services");
    }
};

// Retrieve one active service by MongoDB ID
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
                message: "Active service not found.",
            });
        }

        return res.status(200).json(
            serializeService(service)
        );
    } catch (error) {
        return handleError(res, error, "Get service");
    }
};

// Partially update an existing service
const updateService = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid service ID.",
            });
        }

        const validationError = validatePayload(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError,
            });
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
            return res.status(404).json({
                message: "Service not found.",
            });
        }

        return res.status(200).json({
            message: "Service updated successfully.",
            service: serializeService(service),
        });
    } catch (error) {
        return handleError(res, error, "Update service");
    }
};

// Soft-delete an active service
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid service ID.",
            });
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
            return res.status(404).json({
                message: "Active service not found.",
            });
        }

        return res.status(200).json({
            message: "Service deactivated successfully.",
            service: serializeService(service),
        });
    } catch (error) {
        return handleError(res, error, "Delete service");
    }
};

module.exports = {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService,
};
