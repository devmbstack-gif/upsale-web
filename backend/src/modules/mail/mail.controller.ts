import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import { SendMailDto } from './mail.dto.js';
import { MailService } from './mail.service.js';

@Controller('internal/mail')
export class MailController {
  constructor(
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  send(
    @Headers('x-internal-api-key') provided: string | undefined,
    @Body() payload: SendMailDto,
  ) {
    const expected = this.config.getOrThrow<string>('INTERNAL_API_SECRET');
    const left = Buffer.from(provided ?? '');
    const right = Buffer.from(expected);
    if (left.length !== right.length || !timingSafeEqual(left, right)) {
      throw new UnauthorizedException();
    }
    return this.mail.send(payload);
  }
}
