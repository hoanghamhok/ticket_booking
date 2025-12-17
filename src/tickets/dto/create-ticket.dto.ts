import { IsString, IsInt, Min } from 'class-validator';

export class CreateTicketsDto {
  @IsString()
  eventId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  @Min(0)
  price: number;
}
