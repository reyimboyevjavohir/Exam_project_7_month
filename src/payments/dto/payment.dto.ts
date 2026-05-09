import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 800000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ example: '2024-01' })
  @IsString()
  month: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  studentId: number;

  @ApiPropertyOptional({ example: 'Yanvar oyi to\'lovi' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: PaymentStatus, default: PaymentStatus.PAID })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}
