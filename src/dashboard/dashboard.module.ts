import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Student } from '../students/student.entity';
import { Teacher } from '../teachers/teacher.entity';
import { Group } from '../groups/group.entity';
import { Payment } from '../payments/payment.entity';
import { Complaint } from '../complaints/complaint.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Teacher, Group, Payment, Complaint])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
