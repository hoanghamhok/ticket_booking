// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { BookingsModule } from './bookings/bookings.module';
import { AppService } from './app.service';
import { TicketsModule } from './tickets/tickets.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    // Nạp biến môi trường từ file .env
    ConfigModule.forRoot({isGlobal: true, }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    EventsModule,
    BookingsModule,
    EventsModule,
    TicketsModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
