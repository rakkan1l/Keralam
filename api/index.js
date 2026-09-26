// Vercel serverless entry: the whole Express API runs as one function.
// The Mongo connection is cached across warm invocations.
import { connectDB } from '../server/src/config/db.js';
import { createApp } from '../server/src/app.js';

let connecting;
let app;

export default async function handler(req, res) {
  connecting ??= connectDB().catch((err) => {
    connecting = undefined;
    throw err;
  });
  await connecting;
  app ??= createApp();
  return app(req, res);
}
