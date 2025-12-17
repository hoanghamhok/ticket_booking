import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Concert 2025' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Amazing music event', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2025-12-20T19:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  startAt: string;

  @ApiProperty({ example: '2025-12-20T23:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  endAt: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/xxx/image/upload/v123/events/abc.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;
}