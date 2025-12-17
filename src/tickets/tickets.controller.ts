// src/tickets/tickets.controller.ts
import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketStatus } from '@prisma/client';
import { ApiTags,ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateTicketsDto } from './dto/create-ticket.dto';

@ApiTags('Tickets')
@ApiBearerAuth('JWT-auth')
@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  // GET /tickets/events/:eventId/available-count
  @Get('events/:eventId/available-count')
  @ApiOperation({summary:'Get available tickets count for an event'})
  getAvailableCount(@Param('eventId') eventId: string) {
    return this.ticketsService.getAvailableTicketsCount(eventId);
  }

  // GET /tickets/events/:eventId?status=AVAILABLE
  @Get('events/:eventId')
  @ApiOperation({summary:'List tickets by event'})
  listByEvent(
    @Param('eventId') eventId: string,
    @Query('status') status?: TicketStatus,
  ) {
    return this.ticketsService.listTicketsByEvent(eventId, status);
  }

  // POST /tickets (admin)
  @Post('create')
  @ApiOperation({summary:'Create tickets for an event'})
  createTickets(@Body() dto: CreateTicketsDto) {
    return this.ticketsService.createTickets(dto.eventId, dto.quantity, dto.price);
  }
}
