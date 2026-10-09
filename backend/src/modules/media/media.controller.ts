import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteLogoDto, UploadLogoDto } from './media.dto.js';
import { MediaService } from './media.service.js';

@Controller('internal/media')
export class MediaController {
  constructor(private readonly media: MediaService, private readonly config: ConfigService) {}
  private authorize(secret?: string) {
    if (!secret || secret !== this.config.getOrThrow<string>('INTERNAL_API_SECRET')) throw new UnauthorizedException();
  }
  @Post('logo')
  upload(@Headers('x-internal-secret') secret: string | undefined, @Body() dto: UploadLogoDto) {
    this.authorize(secret); return this.media.uploadLogo(dto.dataUrl, dto.businessId);
  }
  @Post('product')
  uploadProduct(@Headers('x-internal-secret') secret: string | undefined, @Body() dto: UploadLogoDto) {
    this.authorize(secret); return this.media.uploadProduct(dto.dataUrl, dto.businessId);
  }
  @Post('logo/delete')
  remove(@Headers('x-internal-secret') secret: string | undefined, @Body() dto: DeleteLogoDto) {
    this.authorize(secret); return this.media.deleteLogo(dto.publicId);
  }
}
