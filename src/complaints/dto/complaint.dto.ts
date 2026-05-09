import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ComplaintStatus } from '../complaint.entity';

export class CreateComplaintDto {
  @ApiProperty({ example: 'To\'lov muammosi' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'To\'lovimni qabul qilishmadi' })
  @IsString()
  description: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  contactPhone: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  studentId?: number;
}

export class UpdateComplaintDto {
  @ApiPropertyOptional({ enum: ComplaintStatus })
  @IsOptional()
  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus;

  @ApiPropertyOptional({ example: 'Ko\'rib chiqildi' })
  @IsOptional()
  @IsString()
  adminResponse?: string;
}
