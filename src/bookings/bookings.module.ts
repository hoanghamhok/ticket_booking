import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingExpirationJob } from './booking-expiration.job';
import { AuthModule } from 'src/auth/auth.module';
import {PrismaModule} from 'src/prisma/prisma.module';

@Module({
  imports: [AuthModule,PrismaModule],
  providers: [BookingsService,BookingExpirationJob],
  controllers: [BookingsController]
})
export class BookingsModule {}
