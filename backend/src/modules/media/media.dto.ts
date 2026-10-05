import { IsMongoId, IsString, Matches, MinLength } from 'class-validator';

export class UploadLogoDto {
  @IsMongoId() businessId: string;
  @IsString() @Matches(/^data:image\/(png|jpeg|webp);base64,/i) dataUrl: string;
}

export class DeleteLogoDto {
  @IsString() @MinLength(10) publicId: string;
}
