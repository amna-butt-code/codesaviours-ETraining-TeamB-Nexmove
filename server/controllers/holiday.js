const mongoose = require("mongoose");
const Holiday = require("../models/holiday");
const Therapist = require("../models/therapist");
const  {StatusCode}  = require("../consts/statusCode");
const  responseHandler  = require("../utils/responseHandler");

const createHoliday = async (req, res) => {
    try {
        const { date, reason, scope = "clinic", therapist } = req.body;

        if (!date ||typeof reason !== "string" || !reason.trim())        
            {
                 return responseHandler(res, StatusCode.BAD_REQUEST);
        }

        const holidayDate = new Date(date);

        if (Number.isNaN(holidayDate.getTime())) {
           return responseHandler(res,StatusCode.BAD_REQUEST,"Please provide a valid date.");
        }

        if (!["clinic", "therapist"].includes(scope)) {
            return responseHandler(res, StatusCode.BAD_REQUEST,"Scope must be clinic or therapist.");
        }

        let therapistId = null;

        if (scope === "therapist") {
            if (!mongoose.isValidObjectId(therapist)) {
                return responseHandler(res, StatusCode.BAD_REQUEST, "A valid therapist ID is required for a therapist holiday.");
            }

            const therapistExists = await Therapist.findById(therapist);

            if (!therapistExists) {
                return responseHandler(res, StatusCode.NOT_FOUND, "Therapist not found.");
            }

            therapistId = therapistExists._id;
        }

        const holiday = await Holiday.create({
            date: holidayDate,
            reason: reason.trim(),
            scope,
            therapist: therapistId
        });

        return responseHandler(res,StatusCode.INSERTED,"Holiday created successfully.",{ holiday });
    } catch (error) {
        console.error("Create holiday error:", error);

        return responseHandler(res, StatusCode.SERVER_ERROR, "Failed to create holiday.");
    }
};

const getHolidays = async (req, res) => {
    try {
        const { therapistId, startDate, endDate } = req.query;
        const filter = {};

        if (therapistId) {
            if (!mongoose.isValidObjectId(therapistId)) {
                return responseHandler(res, StatusCode.BAD_REQUEST, "Invalid therapist ID.");
            }

            filter.$or = [
                { scope: "clinic" },
                { scope: "therapist", therapist: therapistId }
            ];
        }

        if (startDate || endDate) {
            filter.date = {};

            if (startDate) {
                const start = new Date(startDate);

                if (Number.isNaN(start.getTime())) {
                    return responseHandler(res, StatusCode.BAD_REQUEST, "Invalid start date.");
                }

                filter.date.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);

                if (Number.isNaN(end.getTime())) {
                    return responseHandler(res, StatusCode.BAD_REQUEST, "Invalid end date.");
                }

                filter.date.$lte = end;
            }

            if (
                filter.date.$gte &&
                filter.date.$lte &&
                filter.date.$gte > filter.date.$lte
            ) {
                return responseHandler(res, StatusCode.BAD_REQUEST, "Start date must be before end date.");
            }
        }

        const holidays = await Holiday.find(filter)
            .populate("therapist", "name")
            .sort({ date: 1 });

       return responseHandler(res,StatusCode.SUCCESS,"Holidays retrieved successfully.",
       {
        count: holidays.length,
        holidays
         }
);
    } catch (error) {
        console.error("Get holidays error:", error);

        return responseHandler(res, StatusCode.SERVER_ERROR, "Failed to retrieve holidays.");
    }
};

module.exports = {createHoliday,getHolidays};