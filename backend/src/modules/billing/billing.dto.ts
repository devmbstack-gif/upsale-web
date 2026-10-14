import { IsMongoId, IsString, Matches } from 'class-validator';

export class CreateCheckoutDto {
  @IsMongoId()
  businessId: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  planSlug: string;

  @IsString()
  @Matches(/^\/(?:choose-plan|app\/billing)\?payment=success$/)
  successUrl: string;

  @IsString()
  @Matches(/^\/(?:choose-plan|app\/billing)\?payment=cancelled$/)
  cancelUrl: string;
}

export class ConfirmCheckoutDto {
  @IsMongoId()
  businessId: string;

  @IsString()
  sessionId: string;
}
