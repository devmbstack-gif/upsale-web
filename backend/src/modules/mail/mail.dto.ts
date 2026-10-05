import { IsEmail, IsIn, IsOptional, Matches } from 'class-validator';

export class SendMailDto {
  @IsIn(['otp', 'password-reset-otp'])
  type!: 'otp' | 'password-reset-otp';

  @IsEmail()
  to!: string;

  @IsOptional()
  @Matches(/^\d{6}$/)
  code?: string;

}
