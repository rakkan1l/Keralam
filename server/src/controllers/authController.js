import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created } from '../utils/response.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../middleware/auth.js';

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (await User.exists({ email })) throw ApiError.conflict('An account with this email already exists');
  const user = await User.create({ name, email, password });
  const token = signToken(user);
  setAuthCookie(res, token);
  return created(res, { user: user.toSafeJSON(), token });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  // Same message for unknown email and wrong password to avoid account enumeration.
  if (!user || !(await user.comparePassword(password))) throw ApiError.unauthorized('Invalid email or password');
  if (!user.isActive) throw ApiError.forbidden('This account has been disabled');
  user.lastLoginAt = new Date();
  await user.save();
  const token = signToken(user);
  setAuthCookie(res, token);
  return ok(res, { user: user.toSafeJSON(), token });
}

export async function logout(_req, res) {
  clearAuthCookie(res);
  return ok(res, { loggedOut: true });
}

export async function me(req, res) {
  return ok(res, { user: req.user ? req.user.toSafeJSON() : null });
}
