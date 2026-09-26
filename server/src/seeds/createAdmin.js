/* eslint-disable no-console */
// Creates (or promotes) an admin account from ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD.
import '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';

async function main() {
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || '';
  const name = process.env.ADMIN_NAME || 'Platform Admin';
  if (!email || password.length < 10) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (min 10 chars) in server/.env first');
  }
  await connectDB();
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    existing.isActive = true;
    await existing.save();
    console.log(`Promoted existing user ${email} to admin.`);
  } else {
    await User.create({ name, email, password, role: 'admin' });
    console.log(`Created admin ${email}. Change the password after first login.`);
  }
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
