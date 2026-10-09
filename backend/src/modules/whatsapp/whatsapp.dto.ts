import { IsArray, IsBoolean, IsDateString, IsEmail, IsIn, IsMongoId, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ConnectWhatsAppDto {
  @IsMongoId() businessId: string;
  @IsString() @MinLength(20) accessToken: string;
  @IsString() @Matches(/^\d+$/) phoneNumberId: string;
  @IsString() @Matches(/^\d+$/) businessAccountId: string;
}

export class BusinessRequestDto { @IsMongoId() businessId: string; }

export class TestWhatsAppDto extends BusinessRequestDto {
  @IsString() @Matches(/^\+?\d{8,15}$/) recipient: string;
}

export class VerifyNumberDto {
  @IsString() @Matches(/^\+?\d{8,15}$/) phone: string;
}

export class CampaignRecipientDto {
  @IsMongoId() customerId: string;
  @IsString() name: string;
  @IsString() @Matches(/^\+?\d{8,15}$/) phone: string;
}

export class SendCampaignDto extends BusinessRequestDto {
  @IsMongoId() dealId: string;
  @IsString() @MinLength(1) @MaxLength(4096) message: string;
  @IsOptional() @IsString() templateName?: string;
  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) productImageUrl?: string;
  @IsOptional() @IsString() @MaxLength(2200) postCaption?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CampaignRecipientDto)
  recipients: CampaignRecipientDto[];
}

export class ScheduleCampaignDto extends SendCampaignDto {
  @IsDateString() scheduledAt: string;
  @IsIn(['once', 'daily', 'weekly']) scheduleType: 'once' | 'daily' | 'weekly';
}

export class WhatsAppPreferencesDto extends BusinessRequestDto {
  @IsBoolean() failureEmailAlerts: boolean;
  @IsOptional() @IsEmail() failureAlertEmail?: string;
}
