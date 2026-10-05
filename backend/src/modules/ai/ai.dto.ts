import { IsIn, IsNumber, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';

export class GenerateDealDto {
  @IsString() businessName: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() currency?: string;
  @IsIn(['all', 'new', 'repeat', 'vip', 'at_risk']) audience: string;
  @IsObject() stats: Record<string, unknown>;
  @IsNumber() @Min(0) @Max(20) variant: number;
}
