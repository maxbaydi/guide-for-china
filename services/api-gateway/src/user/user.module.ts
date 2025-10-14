import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from './user.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        baseURL:
          configService.get<string>('USER_SERVICE_URL') ||
          'http://user-service:4002',
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

