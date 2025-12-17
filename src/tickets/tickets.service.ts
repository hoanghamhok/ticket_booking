// src/tickets/tickets.service.ts
import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async getAvailableTicketsCount(eventId: string) {
    return this.prisma.ticket.count({
      where: { eventId, status: TicketStatus.AVAILABLE },
    });
  }

  // Admin: bulk create tickets cho 1 event
  async createTickets(eventId: string, quantity: number, price: number) {
    if (quantity <= 0) throw new BadRequestException('quantity must be > 0');
    if (price < 0) throw new BadRequestException('price must be >= 0');

    // check event exists (to avoid orphan tickets)
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new BadRequestException('Event not found');

    const data = Array.from({ length: quantity }).map(() => ({
      eventId,
      price,
      status: TicketStatus.AVAILABLE,
    }));

    const created = await this.prisma.ticket.createMany({ data });
    return { created: created.count };
  }

  // (optional) list tickets by event (admin/backoffice)
  async listTicketsByEvent(eventId: string, status?: TicketStatus) {
    return this.prisma.ticket.findMany({
      where: { eventId, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'asc' },
    });
  }
}
