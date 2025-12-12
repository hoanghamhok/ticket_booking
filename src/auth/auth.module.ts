import { Module } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js'
import { AuthController } from '../auth/auth.controller.js';

@Module({
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
