import { Controller,Get,Body,Post,Req,UseGuards,Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import  {BookingsService} from '../bookings/bookings.service'
import { HoldTicketDto } from '../bookings/dto/hold-ticket.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Bookings')
@Controller('bookings')



export class BookingsController {
    constructor(private bookingsService: BookingsService){}

    @Post('hold')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({summary:'Hold tickets for an event'})
    async hold(@Req() req,@Body() dto:HoldTicketDto){
        return this.bookingsService.holdTickets(req.user.userId,dto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({summary:'Get my bookings'})
    getMyBookings(@Req() req){
        return this.bookingsService.getMyBookings(req.user.userId);
    }

    @Post(':bookingId/pay')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Pay a booking (mark booking/tickets as PAID)' })
    pay(@Req() req, @Param('bookingId') bookingId: string) {
        return this.bookingsService.payBooking(req.user.userId, bookingId);
    }

}
