const { z } = require("zod");

const fields = {
  name: z.string().trim().min(3, "Package name must be at least 3 characters").max(120, "Package name must be 120 characters or fewer"),
  slug: z.string().trim().toLowerCase().min(2, "Slug is too short").max(140, "Slug must be 140 characters or fewer").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only use lowercase letters, numbers and single hyphens"),
  description: z.string().trim().min(1, "Description is required").max(1000, "Description must be 1000 characters or fewer"),
  price: z.number().finite().min(0, "Price cannot be negative"),
  currency: z.literal("PKR").optional(),
  sessions: z.number().int("Session count must be a whole number").min(1, "A package must include at least one session"),
  isActive: z.boolean().optional(),
};

const createPackageSchema = z.strictObject(fields);

const updatePackageSchema = z
  .strictObject(fields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Send at least one field to update",
  });

module.exports = { createPackageSchema, updatePackageSchema };

