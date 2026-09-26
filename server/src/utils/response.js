// Every successful response has the shape { success: true, data, meta? }.
// Errors (see middleware/error.js) have { success: false, error: { message, details? } }.
export function ok(res, data, meta, status = 200) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

export function created(res, data) {
  return ok(res, data, undefined, 201);
}
