import { Router } from 'express';
import authRoutes from './authRoutes.js';
import meRoutes from './meRoutes.js';
import adminRoutes from './adminRoutes.js';
import publicRoutes from './publicRoutes.js';

const api = Router();
api.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok', time: new Date().toISOString() } }));
api.use('/auth', authRoutes);
api.use('/admin', adminRoutes);
api.use('/', meRoutes);
api.use('/', publicRoutes);
export default api;
