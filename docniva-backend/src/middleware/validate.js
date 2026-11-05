import { z } from "zod";

// Valid MongoDB ObjectId (24 hex characters)
export const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

/**
 * Use:
 *   router.post("/", validate({ body: schema, params: schema, query: schema }), handler)
 *
 * Express 5 mein req.query read-only hai, isliye checked data
 * req.validated.body / .params / .query mein milta hai.
 */
export const validate = (schemas) => (req, res, next) => {
  const errors = [];
  req.validated = {};

  for (const key of ["body", "params", "query"]) {
    if (!schemas[key]) continue;

    const result = schemas[key].safeParse(req[key] ?? {});

    if (result.success) {
      req.validated[key] = result.data;
    } else {
      for (const issue of result.error.issues) {
        errors.push({
          field: issue.path.join("."),
          message: issue.message,
        });
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0].message,
      errors,
    });
  }

  next();
};