const { z } = require("zod");

const fields = {
  title: z.string().trim().min(2, "Title is too short").max(120, "Title must be 120 characters or fewer"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Slug is too short")
    .max(140, "Slug must be 140 characters or fewer")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only use lowercase letters, numbers and single hyphens"),
  summary: z.string().trim().min(1, "Summary is required").max(300, "Summary must be 300 characters or fewer"),
  description: z.string().trim().min(1, "Description is required").max(10000, "Description is too long"),
  commonSymptoms: z
    .array(z.string().trim().min(1, "Symptom can't be empty").max(150, "Each symptom must be 150 characters or fewer"))
    .max(20, "Please list 20 symptoms or fewer")
    .optional(),
  whenToSeekHelp: z.string().trim().max(1000, "Keep this under 1000 characters").optional(),
  isPublished: z.boolean().optional(),
};

const createConditionSchema = z.strictObject({ ...fields });

const updateConditionSchema = z
  .strictObject({ ...fields })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "Send at least one field to update" });

module.exports = { createConditionSchema, updateConditionSchema };