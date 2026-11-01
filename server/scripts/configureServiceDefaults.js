
require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

const mongoose = require("mongoose");
const Service = require("../models/service");

const SERVICE_DEFAULTS = {
  duration: 45,
  durationIsEstimated: true,
  price: 1500,
};

async function configureServices() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Refusing to update services in production."
    );
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in server/.env");
  }

  const applyChanges = process.argv.includes("--apply");

  if (
    applyChanges &&
    process.env.CONFIRM_NEXMOVE_SERVICE_CONFIG !== "YES"
  ) {
    throw new Error(
      "Set CONFIRM_NEXMOVE_SERVICE_CONFIG=YES before applying changes."
    );
  }

  await mongoose.connect(process.env.MONGO_URI);

  console.log("Connected to database:");
  console.log(`Database: ${mongoose.connection.name}`);
  console.log(`Host: ${mongoose.connection.host}`);

  // Include active services and legacy records where isActive is missing.
  const allServices = await Service.find({})
    .select("name duration durationIsEstimated price isActive")
    .sort({ name: 1 })
    .lean();

  const activeServices = allServices.filter(
    (service) => service.isActive !== false
  );

  if (activeServices.length === 0) {
    throw new Error(
      "No active services were found. No changes were made."
    );
  }

  console.log("\nServices found:");
  console.table(
    activeServices.map((service) => ({
      name: service.name,
      oldDuration: service.duration ?? "Missing",
      oldPrice: service.price ?? "Missing",
      isActive: service.isActive ?? "Default active",
    }))
  );

  if (!applyChanges) {
    console.log("\nPREVIEW ONLY — no database changes were made.");
    console.log(
      "Review the services above, then rerun with --apply."
    );
    return;
  }

  const serviceIds = activeServices.map(
    (service) => service._id
  );

  const result = await Service.updateMany(
    {
      _id: { $in: serviceIds },
    },
    {
      $set: SERVICE_DEFAULTS,
    },
    {
      runValidators: true,
    }
  );

  const updatedServices = await Service.find({
    _id: { $in: serviceIds },
  })
    .select("name duration durationIsEstimated price isActive")
    .sort({ name: 1 })
    .lean();

  const invalidServices = updatedServices.filter(
    (service) =>
      service.duration !== SERVICE_DEFAULTS.duration ||
      service.durationIsEstimated !== true ||
      service.price !== SERVICE_DEFAULTS.price
  );

  if (invalidServices.length > 0) {
    throw new Error(
      `Configuration verification failed for: ${
        invalidServices.map((service) => service.name).join(", ")
      }`
    );
  }

  console.log("\nService configuration updated successfully.");
  console.log(`Matched: ${result.matchedCount}`);
  console.log(`Modified: ${result.modifiedCount}`);

  console.table(
    updatedServices.map((service) => ({
      name: service.name,
      duration: `${service.duration} minutes`,
      durationIsEstimated: service.durationIsEstimated,
      price: `PKR ${service.price}`,
      isActive: service.isActive,
    }))
  );
}

configureServices()
  .catch((error) => {
    console.error("\nService configuration failed:");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
