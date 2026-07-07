import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

interface UploadOptions {
  folder?: string;
  width?: number;
  height?: number;
}

const uploadOnCloudinary = (
  fileBuffer: Buffer,
  options?: UploadOptions
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) return reject("No file buffer");

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options?.folder || 'general', // ✅ dynamic
        resource_type: 'image',

        // ✅ optional optimization
        transformation: [
          {
            width: options?.width || 500,
            height: options?.height || 500,
            crop: 'limit',
          },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary Error:", error);
          return reject(error);
        }
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

export { uploadOnCloudinary };