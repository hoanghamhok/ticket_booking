import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { EventsModule } from './events/events.module.js';
import { BookingsModule } from './bookings/bookings.module.js';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, EventsModule, BookingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
