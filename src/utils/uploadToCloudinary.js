import cloudinary from 'cloudinary';
import fs from 'fs/promises';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath, {
      folder: 'contacts',
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' },
      ],
    });

    await fs.unlink(filePath);

    return result.secure_url;
  } catch (error) {
    await fs.unlink(filePath).catch(() => {});
    throw error;
  }
};

export const deleteFromCloudinary = async (photoUrl) => {
  try {
    const urlParts = photoUrl.split('/');
    const filename = urlParts[urlParts.length - 1].split('_')[0];
    const folder = urlParts[urlParts.length - 2];
    const publicId = `${folder}/${filename}`;

    await cloudinary.v2.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};
