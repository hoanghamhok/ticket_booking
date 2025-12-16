
import { Injectable,BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HoldTicketDto } from '../bookings/dto/hold-ticket.dto';
import { TicketStatus, BookingStatus } from '@prisma/client';
@Injectable()
export class BookingsService {
    constructor(private prisma: PrismaService) {}

    async holdTickets(userId:string,dto:HoldTicketDto){
        const holdMinutes = Number(process.env.HOLD_MINUTES) || 15;
        const holdUntil = new Date(Date.now() + holdMinutes * 60000);

        return this.prisma.$transaction(async(tx)=>{
            // Fetch available tickets
            const tickets = await tx.ticket.findMany({
                where:{
                    eventId:dto.eventId,
                    status:TicketStatus.AVAILABLE,
                },
                take:dto.quantity,
                orderBy:{createdAt:'asc'},
            });

            if(tickets.length < dto.quantity){
                throw new BadRequestException('Not enough available tickets');
            }

            const ticketsIds = tickets.map(ticket=>ticket.id);

            // Update ticket status to HELD
            const updated = await tx.ticket.updateMany({
                where:{
                    id:{in:ticketsIds},
                    status:TicketStatus.AVAILABLE,
                },
                data:{
                    status:TicketStatus.HOLD,
                    holdById:userId,
                    holdUntil,
                },
            })

            if(updated.count != dto.quantity){
                throw new BadRequestException('Tickets were just booked by someone else. Please try again.');
            }

            //Creat a booking record
            const booking = await tx.booking.create({
                data:{
                    userId,
                    status:BookingStatus.HOLD,
                    expiresAt:holdUntil,
                    total:tickets.reduce((sum,ticket)=>sum+ticket.price,0),
                    items:{
                        create:tickets.map(ticket =>({
                            ticketId:ticket.id,
                            price:ticket.price,
                        }))
                    },
                },
                include:{
                    items:true,
                },
            });
            return booking;
        })
        
    }

    async getMyBookings(userId:string){
        return this.prisma.booking.findMany({
            where:{userId},
            orderBy:{createdAt:'desc'},
            include:{
                items:{
                    include:{
                        ticket:{include:{event:true}},
                    },
                },
            },
        });
    }

}
