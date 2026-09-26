import { ApiError } from '../utils/ApiError.js';

/**
 * Validate req[part] with a zod schema. Parsed output replaces req.body; for query
 * parameters (read-only getter in Express 5) it is exposed as req.validatedQuery.
 */
export function validate(schema, part = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[part] ?? {});
    if (!result.success) {
      const details = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      throw ApiError.badRequest('Validation failed', details);
    }
    if (part === 'body') req.body = result.data;
    else req.validatedQuery = result.data;
    next();
  };
}
