import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { writeLimiter } from '../middleware/rateLimits.js';
import { profileSchema, changePasswordSchema, saveSchema, syncSavedSchema, listSchema, listItemSchema } from '../validators/user.js';
import * as me from '../controllers/meController.js';
import * as lists from '../controllers/listController.js';
import * as community from '../controllers/communityController.js';
import { upload } from '../controllers/metaController.js';
import { ApiError } from '../utils/ApiError.js';

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) =>
    /^image\/(jpeg|png|webp|avif)$/.test(file.mimetype) ? cb(null, true) : cb(ApiError.badRequest('Only JPEG, PNG, WebP or AVIF images are allowed')),
});

const r = Router();
r.get('/lists/shared/:slug', lists.shared); // public

r.get('/me', requireAuth, me.getProfile);
r.patch('/me', requireAuth, validate(profileSchema), me.updateProfile);
r.post('/me/password', requireAuth, validate(changePasswordSchema), me.changePassword);
r.get('/me/saved', requireAuth, me.listSaved);
r.get('/me/saved/ids', requireAuth, me.savedIds);
r.post('/me/saved', requireAuth, validate(saveSchema), me.save);
r.post('/me/saved/sync', requireAuth, validate(syncSavedSchema), me.syncSaved);
r.delete('/me/saved/:targetType/:targetId', requireAuth, me.unsave);
r.get('/me/recent', requireAuth, me.recent);
r.get('/me/reviews', requireAuth, community.myReviews);

r.get('/lists', requireAuth, lists.mine);
r.post('/lists', requireAuth, validate(listSchema), lists.create);
r.get('/lists/:id', requireAuth, lists.get);
r.patch('/lists/:id', requireAuth, validate(listSchema.partial()), lists.update);
r.delete('/lists/:id', requireAuth, lists.remove);
r.post('/lists/:id/items', requireAuth, validate(listItemSchema), lists.addItem);
r.delete('/lists/:id/items/:targetType/:targetId', requireAuth, lists.removeItem);

r.post('/uploads', requireAuth, writeLimiter, imageUpload.single('image'), upload);
export default r;
