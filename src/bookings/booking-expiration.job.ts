import {Injectable,Logger} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {PrismaService} from 'src/prisma/prisma.service';
import { TicketStatus, BookingStatus } from '@prisma/client';

export class BookingExpirationJob{
    private readonly logger = new Logger(BookingExpirationJob.name);

    constructor(private prisma:PrismaService){}

    @Cron('*/1 * * * *')
    async handleExpiredBookings(){
        const now = new Date();

        const expiredBooking = await this.prisma.booking.findMany({
            where:{
                status:BookingStatus.HOLD,
                expiresAt:{lt:now},                
            },
            include:{items:true},
        });

        for(const booking of expiredBooking){
            await this.prisma.$transaction(async(tx)=>{
                //expire the booking
                await tx.booking.update({
                    where:{id:booking.id},
                    data:{status:BookingStatus.EXPIRED},
                });
                //return tickets to available
                await tx.ticket.updateMany({
                    where:{
                        id:{in:booking.items.map(item=>item.ticketId)},
                        status:TicketStatus.HOLD,
                    },
                    data:{
                        status:TicketStatus.AVAILABLE,
                        holdById:null,
                        holdUntil:null,
                    },
                });
            });
            this.logger.log(`Expired booking ${booking.id} and released ${booking.items.length} tickets.`);
        };
    };
}