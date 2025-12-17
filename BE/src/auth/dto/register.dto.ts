import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ 
    example: 'user@example.com',
    description: 'User email address',
    required: true
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'password123',
    description: 'User password',
    minLength: 6,
    required: true
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}