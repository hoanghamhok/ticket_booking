import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: createEventDto.title,
        description: createEventDto.description,
        startAt: new Date(createEventDto.startAt),
        endAt: new Date(createEventDto.endAt),
      },
    });
  }

  async findAll() {
    return this.prisma.event.findMany({
      orderBy: { startAt: 'asc' },
      include: {
        tickets: {
          select: {
            id: true,
            price: true,
            status: true,
          },
        },
      },
    });
  }

  async findUpcoming() {
    return this.prisma.event.findMany({
      where: {
        startAt: { gte: new Date() },
      },
      orderBy: { startAt: 'asc' },
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        tickets: true,
        _count: {
          select: { tickets: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.event.update({
      where: { id },
      data: {
        ...(updateEventDto.title && { title: updateEventDto.title }),
        ...(updateEventDto.description !== undefined && { description: updateEventDto.description }),
        ...(updateEventDto.startAt && { startAt: new Date(updateEventDto.startAt) }),
        ...(updateEventDto.endAt && { endAt: new Date(updateEventDto.endAt) }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.event.delete({
      where: { id },
    });
  }

  // Get available tickets count for an event
  async getAvailableTicketsCount(eventId: string) {
    return this.prisma.ticket.count({
      where: {
        eventId,
        status: 'AVAILABLE',
      },
    });
  }
}