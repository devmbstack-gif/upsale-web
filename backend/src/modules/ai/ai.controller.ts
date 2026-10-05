import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateDealDto } from './ai.dto.js';
import { AiService } from './ai.service.js';

@Controller('internal/ai')
export class AiController {
  constructor(private readonly ai: AiService, private readonly config: ConfigService) {}
  @Post('deal')
  generate(@Headers('x-internal-secret') secret: string | undefined, @Body() dto: GenerateDealDto) {
    if (!secret || secret !== this.config.getOrThrow<string>('INTERNAL_API_SECRET')) throw new UnauthorizedException();
    return this.ai.generateDeal(dto);
  }
}
