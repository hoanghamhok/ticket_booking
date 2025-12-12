import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingExpirationJob } from './booking-expiration.job';

@Module({
  providers: [BookingsService,BookingExpirationJob],
  controllers: [BookingsController]
})
export class BookingsModule {}
