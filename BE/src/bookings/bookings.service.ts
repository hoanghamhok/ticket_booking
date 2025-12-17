
import { Injectable,BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HoldTicketDto } from '../bookings/dto/hold-ticket.dto';
import { TicketStatus, BookingStatus } from '@prisma/client';
import { ForbiddenException,InternalServerErrorException } from '@nestjs/common';


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

    async payBooking(userId: string, bookingId: string) {
        const now = new Date();
      
        return this.prisma.$transaction(async (tx) => {
          const booking = await tx.booking.findUnique({
            where: { id: bookingId },
            include: { items: true },
          });
          if (!booking) throw new BadRequestException('Booking not found');
          if (booking.userId !== userId) throw new ForbiddenException();
          if (booking.status !== BookingStatus.HOLD) throw new BadRequestException('Booking is not HOLD');
          if (booking.expiresAt && booking.expiresAt <= now) throw new BadRequestException('Booking expired');
      
          const ticketIds = booking.items.map((i) => i.ticketId);
      
          // Ticket phải đang HOLD và holdById đúng user
          const updated = await tx.ticket.updateMany({
            where: {
              id: { in: ticketIds },
              status: TicketStatus.HOLD,
              holdById: userId,
              holdUntil: { gt: now },
            },
            data: { status: TicketStatus.PAID },
          });
      
          if (updated.count !== ticketIds.length) {
            throw new BadRequestException('Some tickets are no longer held. Please try again.');
          }
      
          return tx.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.PAID },
            include: { items: true },
          });
        });
      }

}
