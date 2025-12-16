// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { BookingsModule } from './bookings/bookings.module';
import { AppService } from './app.service';

@Module({
  imports: [
    // Nạp biến môi trường từ file .env
    ConfigModule.forRoot({
      isGlobal: true, // để có thể dùng ở mọi module mà không cần import lại
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    EventsModule,
    BookingsModule,
    EventsModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
