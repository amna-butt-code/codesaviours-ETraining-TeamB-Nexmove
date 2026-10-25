const { z } = require("zod");

const fields = {
  title: z.string().trim().min(5, "Title is too short").max(150, "Title must be 150 characters or fewer"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Slug is too short")
    .max(170, "Slug must be 170 characters or fewer")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only use lowercase letters, numbers and single hyphens"),
  excerpt: z.string().trim().max(300, "Excerpt must be 300 characters or fewer").optional(),
  content: z.string().trim().min(1, "Content is required").max(50000, "Content is too long"),
  category: z.string().trim().min(1, "Category can't be empty").max(60, "Category must be 60 characters or fewer").optional(),
  isPublished: z.boolean().optional(),
};

const createPostSchema = z.strictObject({ ...fields });

const updatePostSchema = z
  .strictObject({ ...fields })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "Send at least one field to update" });

module.exports = { createPostSchema, updatePostSchema };