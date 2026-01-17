import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
}

export class CloudinaryService {
  /**
   * Upload a garment image to Cloudinary
   */
  static async uploadGarment(
    fileBuffer: Buffer,
    filename: string
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'airchives/garments',
          resource_type: 'image',
          format: 'webp',
          quality: 'auto:good',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Upload failed'));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          });
        }
      );

      // Convert buffer to stream and pipe to upload
      const readable = new Readable();
      readable._read = () => {};
      readable.push(fileBuffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  /**
   * Upload a generated AI model image
   */
  static async uploadGeneratedImage(
    fileBuffer: Buffer,
    generationId: string,
    index: number
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `airchives/generated/${generationId}`,
          resource_type: 'image',
          format: 'webp',
          quality: 'auto:excellent',
          fetch_format: 'auto',
          public_id: `output_${index}`,
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Upload failed'));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          });
        }
      );

      const readable = new Readable();
      readable._read = () => {};
      readable.push(fileBuffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  /**
   * Delete an image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
  }

  /**
   * Generate a transformed URL for different aspect ratios
   */
  static getTransformedUrl(
    publicId: string,
    aspectRatio: '1:1' | '4:5' | '3:4'
  ): string {
    const transformations = {
      '1:1': { width: 1080, height: 1080, crop: 'fill' },
      '4:5': { width: 1080, height: 1350, crop: 'fill' },
      '3:4': { width: 1080, height: 1440, crop: 'fill' },
    };

    return cloudinary.url(publicId, {
      transformation: transformations[aspectRatio],
      format: 'webp',
      quality: 'auto:excellent',
    });
  }
}
