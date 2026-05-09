import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'superadmin@crm.uz' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SuperAdmin123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty()
  user: {
    id:       number;
    fullName: string;
    email:    string;
    role:     string;
    avatar:   string | null;
    provider: string;
  };
}
