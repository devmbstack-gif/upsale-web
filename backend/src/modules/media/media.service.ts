import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

@Injectable()
export class MediaService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  async uploadLogo(dataUrl: string, businessId: string) {
    if (!/^data:image\/(png|jpeg|webp);base64,/i.test(dataUrl)) {
      throw new BadRequestException('Only PNG, JPG, or WebP images are allowed.');
    }
    const bytes = Buffer.byteLength(dataUrl.split(',')[1] ?? '', 'base64');
    if (!bytes || bytes > 1_500_000) throw new BadRequestException('Logo must be under 1.5 MB.');
    const result = await cloudinary.uploader.upload(dataUrl, {
      resource_type: 'image',
      folder: 'upsale/business-logos',
      public_id: businessId,
      overwrite: true,
      invalidate: true,
      transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
    });
    return { url: result.secure_url, publicId: result.public_id };
  }

  async deleteLogo(publicId: string) {
    if (!publicId.startsWith('upsale/business-logos/')) throw new BadRequestException('Invalid logo storage key.');
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
    return { deleted: true };
  }

  async uploadVideo(path: string): Promise<UploadApiResponse> {
    return cloudinary.uploader.upload(path, {
      resource_type: 'video', folder: 'upsale/demo', public_id: 'product-demo',
      overwrite: true, invalidate: true,
    });
  }
}
