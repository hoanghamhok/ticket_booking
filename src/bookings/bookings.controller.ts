import { Controller,Get,Body,Post,Req,UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import  {BookingsService} from '../bookings/bookings.service.js'
import { HoldTicketDto } from '../bookings/dto/hold-ticket.dto.js';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Bookings')
@ApiBearerAuth('access-token')
@Controller('bookings')
@UseGuards(JwtAuthGuard)


export class BookingsController {
    constructor(private bookingsService: BookingsService){}

    @Post('hold')
    @ApiOperation({summary:'Hold tickets for an event'})
    async hold(@Req() req,@Body() dto:HoldTicketDto){
        return this.bookingsService.holdTickets(req.user.userId,dto);
    }

    @Get('me')
    @ApiOperation({summary:'Get my bookings'})
    getMyBookings(@Req() req){
        return this.bookingsService.getMyBookings(req.user.userId);
    }

}
