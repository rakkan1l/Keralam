import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimits.js';
import { registerSchema, loginSchema } from '../validators/user.js';
import * as auth from '../controllers/authController.js';

const r = Router();
r.post('/register', authLimiter, validate(registerSchema), auth.register);
r.post('/login', authLimiter, validate(loginSchema), auth.login);
r.post('/logout', auth.logout);
r.get('/me', optionalAuth, auth.me);
export default r;
