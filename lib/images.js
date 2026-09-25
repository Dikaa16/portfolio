import { v2 as cloudinary } from 'cloudinary';
import { BlogPost, Photography, Video, Experience, Project, Creative } from '../models.js';

export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
};

export const uploadImage = (buffer, folder) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      folder,
      resource_type: 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }]
    },
    (error, result) => (error ? reject(error) : resolve(result))
  );
  stream.end(buffer);
});

// Cloudinary cleanup: delete images that no item uses anymore
const IMAGE_FIELDS = ['coverImage', 'imageUrl', 'thumbnail', 'logoUrl'];
const IMAGE_MODELS = [BlogPost, Photography, Video, Experience, Project, Creative];

// Only images this app uploaded (our cloud, under portfolio/) are ever deleted
export const cloudinaryPublicId = (url) => {
  if (typeof url !== 'string') return null;
  const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
  if (!url.startsWith(prefix)) return null;
  const match = url.slice(prefix.length).match(/(?:^|\/)v\d+\/(portfolio\/.+)\.[a-z0-9]+$/i);
  return match ? match[1] : null;
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isImageInUse = async (url) => {
  const inFields = await Promise.all(IMAGE_MODELS.flatMap(Model =>
    IMAGE_FIELDS.filter(field => Model.schema.path(field)).map(field => Model.exists({ [field]: url }))
  ));
  if (inFields.some(Boolean)) return true;
  return Boolean(await BlogPost.exists({ content: { $regex: escapeRegex(url) } }));
};

// Call after the DB change. Pass the updated doc to only remove replaced images.
export const cleanupImages = (oldDoc, newDoc = null) => {
  for (const field of IMAGE_FIELDS) {
    const url = oldDoc?.[field];
    const publicId = cloudinaryPublicId(url);
    if (!publicId || newDoc?.[field] === url) continue;
    isImageInUse(url)
      .then(inUse => (inUse ? null : cloudinary.uploader.destroy(publicId)))
      .catch(error => console.error('Cloudinary cleanup error:', error));
  }
};
