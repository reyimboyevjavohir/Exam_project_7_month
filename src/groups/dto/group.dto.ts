import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'N-101' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Matematika' })
  @IsString()
  subject: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  endTime: string;

  @ApiProperty({ example: 'Dushanba, Chorshanba, Juma' })
  @IsString()
  days: string;

  @ApiProperty({ example: 800000 })
  @IsNumber()
  monthlyFee: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  teacherId?: number;
}

export class UpdateGroupDto extends PartialType(CreateGroupDto) {}
