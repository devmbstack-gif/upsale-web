import { IsMongoId, IsString, IsUrl, Matches } from 'class-validator';

export class CreateCheckoutDto {
  @IsMongoId()
  businessId: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  planSlug: string;

  @IsUrl({ require_tld: false })
  successUrl: string;

  @IsUrl({ require_tld: false })
  cancelUrl: string;
}

export class ConfirmCheckoutDto {
  @IsMongoId()
  businessId: string;

  @IsString()
  sessionId: string;
}
