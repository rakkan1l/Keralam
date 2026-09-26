import { v2 as cloudinary } from 'cloudinary';
import { env, features } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

let configured = false;
function ensureConfigured() {
  if (!features.uploads) {
    throw ApiError.unavailable('Image uploads require Cloudinary configuration. Paste an image URL instead.');
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret,
      secure: true,
    });
    configured = true;
  }
}

export function uploadBuffer(buffer, { folder = 'kerala-travel' } = {}) {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ width: 2000, crop: 'limit', quality: 'auto', fetch_format: 'auto' }] },
      (err, result) => (err ? reject(err) : resolve({ url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height })),
    );
    stream.end(buffer);
  });
}
