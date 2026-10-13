import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getHealth() {
    const databaseConnected = this.connection.readyState === 1;

    return {
      status: databaseConnected ? 'ok' : 'degraded',
      service: 'upsale-api',
      database: databaseConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}
