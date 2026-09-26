// Strips keys that start with "$" or contain "." from request bodies/params to block
// MongoDB operator injection. (express-mongo-sanitize is not compatible with Express 5.)
function clean(value, depth = 0) {
  if (depth > 20 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => clean(v, depth + 1));
  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) delete value[key];
    else value[key] = clean(value[key], depth + 1);
  }
  return value;
}

export function sanitizeRequest(req, _res, next) {
  if (req.body) clean(req.body);
  if (req.params) clean(req.params);
  // req.query is a getter in Express 5; clean the parsed object in place.
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      const v = req.query[key];
      if (key.startsWith('$')) delete req.query[key];
      else if (v && typeof v === 'object' && !Array.isArray(v)) delete req.query[key];
    }
  }
  next();
}
