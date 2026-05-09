import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../attendance.entity';

export class CreateAttendanceDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiProperty({ example: 1 })
  @IsNumber()
  studentId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  groupId: number;

  @ApiPropertyOptional({ example: 'Kasalligi sababli' })
  @IsOptional()
  @IsString()
  note?: string;
}

// ── Bulk davomat uchun yordamchi klass ──────────────────────────────
export class AttendanceRecordDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  studentId: number;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional({ example: 'Kasalligi sababli' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class BulkAttendanceDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  groupId: number;

  @ApiProperty({
    type: [AttendanceRecordDto],
    example: [
      { studentId: 1, status: 'present' },
      { studentId: 2, status: 'absent', note: 'Kasalligi sababli' },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}
