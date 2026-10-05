import { v2 as cloudinary } from 'cloudinary';

const filePath = process.argv[2];
if (!filePath) throw new Error('Pass the demo video file path.');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const result = await cloudinary.uploader.upload(filePath, {
  resource_type: 'video',
  folder: 'upsale/demo',
  public_id: 'product-demo',
  overwrite: true,
  invalidate: true,
});

console.log(result.secure_url);
