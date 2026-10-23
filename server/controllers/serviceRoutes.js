
const express = require("express");
const router = express.Router();

const Service = require("../models/service");

const createService = async (req, res) => {
  try {
    const { name, description, duration, price } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof duration !== "number" ||
      typeof price !== "number"
    ) {
      return res.status(400).json({
        message: "Name, numeric duration, and numeric price are required",
      });
    }

    if (duration < 1 || price < 0) {
      return res.status(400).json({
        message: "Duration must be at least 1 minute and price cannot be negative",
      });
    }

    const service = await Service.create({
      name: name.trim(),
      description,
      duration,
      price,
    });

    return res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Create service error:", error.message);
    return res.status(500).json({
      message: "Error creating service",
    });
  }
};

const getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });

    return res.status(200).json(services);
  } catch (error) {
    console.error("Get services error:", error.message);
    return res.status(500).json({
      message: "Error retrieving services",
    });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    return res.status(200).json(service);
  } catch (error) {
    return res.status(400).json({
      message: "Invalid service ID",
    });
  }
};

  module.exports = {createService,getServices,getServiceById}
