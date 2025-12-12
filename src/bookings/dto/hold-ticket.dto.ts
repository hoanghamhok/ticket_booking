import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class HoldTicketDto {
  @IsNotEmpty()
  eventId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
