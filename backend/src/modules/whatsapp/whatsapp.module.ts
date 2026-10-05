import { Module } from '@nestjs/common';
import { WhatsAppController } from './whatsapp.controller.js';
import { WhatsAppService } from './whatsapp.service.js';
import { MailModule } from '../mail/mail.module.js';

@Module({ imports: [MailModule], controllers: [WhatsAppController], providers: [WhatsAppService] })
export class WhatsAppModule {}
