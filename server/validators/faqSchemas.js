const { z } = require("zod");

const fields = {
  question: z.string().trim().min(5, "Question is too short").max(300, "Question must be 300 characters or fewer"),
  answer: z.string().trim().min(1, "Answer is required").max(3000, "Answer must be 3000 characters or fewer"),
  category: z.string().trim().min(1, "Category can't be empty").max(60, "Category must be 60 characters or fewer").optional(),
  order: z.number().int("Order must be a whole number").min(0, "Order can't be negative").max(10000, "Order is too large").optional(),
  isPublished: z.boolean().optional(),
};

// Strict: any field not listed here is rejected, which blocks mass assignment
const createFaqSchema = z.strictObject({ ...fields });

// Update: every field optional, but at least one must be sent
const updateFaqSchema = z
  .strictObject({ ...fields })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "Send at least one field to update" });

module.exports = { createFaqSchema, updateFaqSchema };