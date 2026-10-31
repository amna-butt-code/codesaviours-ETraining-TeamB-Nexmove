// Checks req.body against a Zod schema. The cleaned result replaces req.body,
// so unknown fields never reach the database.
exports.validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join(".") || "body";
      if (!errors[field]) errors[field] = issue.message;
    }
    return res.status(400).json({ success: false, message: "Please check the highlighted fields.", errors });
  }

  req.body = result.data;
  next();
};