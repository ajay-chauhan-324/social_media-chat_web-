import ApiError from '../utils/ApiError.js';

/**
 * Validates req[part] against a Zod schema and replaces it with the parsed
 * (coerced, stripped) value. Usage: router.post('/', validate(schema), handler)
 */
const validate =
  (schema, part = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      return next(ApiError.badRequest('Validation failed', details));
    }
    req[part] = result.data;
    return next();
  };

export default validate;
