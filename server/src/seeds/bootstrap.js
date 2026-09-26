/* eslint-disable no-console */
// Deploy-time bootstrap (runs before the client build on Vercel).
// Seeds sample data only when the database is empty and creates the admin
// account from ADMIN_* variables if it does not exist yet. Never wipes data,
// and never fails the build: if the database is unreachable it just warns.
let disconnectDB = async () => {};

async function main() {
  if (!process.env.MONGODB_URI) {
    console.warn('[bootstrap] MONGODB_URI not set — skipping database bootstrap');
    return;
  }
  // Imported lazily: config/env.js throws on missing production variables.
  const db = await import('../config/db.js');
  const { Place } = await import('../models/Place.js');
  const { User } = await import('../models/User.js');
  const { seed } = await import('./seed.js');
  disconnectDB = db.disconnectDB;
  await db.connectDB();
  if ((await Place.estimatedDocumentCount()) === 0) {
    console.log('[bootstrap] empty database — seeding sample data');
    await seed();
  } else {
    console.log('[bootstrap] database already has data — not seeding');
  }
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || '';
  if (email && password.length >= 10 && !(await User.exists({ email }))) {
    await User.create({ name: process.env.ADMIN_NAME || 'Platform Admin', email, password, role: 'admin' });
    console.log(`[bootstrap] created admin ${email}`);
  }
}

main()
  .catch((err) => console.warn(`[bootstrap] skipped: ${err.message}`))
  .finally(() => disconnectDB().catch(() => {}));
