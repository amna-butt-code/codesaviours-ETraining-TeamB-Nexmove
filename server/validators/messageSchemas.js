const { z } = require("zod");

const updateMessageStatusSchema = z.strictObject({
  status: z.enum(["new", "read", "replied"], { message: "Status must be new, read or replied" }),
});

module.exports = { updateMessageStatusSchema };