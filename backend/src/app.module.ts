import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './modules/users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.getOrThrow<string>('MONGODB_URI');
        if (/127\.0\.0\.1|localhost/i.test(uri)) {
          throw new Error(
            'MONGODB_URI must point to MongoDB Atlas (local database URIs are not allowed).',
          );
        }
        return {
          uri,
          connectionFactory: (connection: {
            on: (event: string, cb: () => void) => void;
            readyState: number;
          }) => {
            connection.on('connected', () => {
              console.log('MongoDB connected');
            });
            connection.on('error', () => {
              console.error('MongoDB connection error');
            });
            // Already open when factory runs in some Nest versions
            if (connection.readyState === 1) {
              console.log('MongoDB connected');
            }
            return connection;
          },
        };
      },
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
