import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEmail } from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({ example: 'Alisher Karimov' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Matematika' })
  @IsString()
  subject: string;

  @ApiPropertyOptional({ example: 'alisher@gmail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  experienceYears?: number;
}

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {}
