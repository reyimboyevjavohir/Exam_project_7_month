import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, StudentStatus } from '../students/student.entity';
import { Teacher } from '../teachers/teacher.entity';
import { Group } from '../groups/group.entity';
import { Payment } from '../payments/payment.entity';
import { Complaint, ComplaintStatus } from '../complaints/complaint.entity';

const MONTH_NAMES = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Student)   private studentsRepo: Repository<Student>,
    @InjectRepository(Teacher)   private teachersRepo: Repository<Teacher>,
    @InjectRepository(Group)     private groupsRepo: Repository<Group>,
    @InjectRepository(Payment)   private paymentsRepo: Repository<Payment>,
    @InjectRepository(Complaint) private complaintsRepo: Repository<Complaint>,
  ) {}

  async getStats() {
    const now = new Date();
    const firstDay     = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay      = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [totalStudents, totalTeachers, totalGroups, newComplaints] = await Promise.all([
      this.studentsRepo.count({ where: { status: StudentStatus.ACTIVE } }),
      this.teachersRepo.count({ where: { isActive: true } }),
      this.groupsRepo.count({ where: { isActive: true } }),
      this.complaintsRepo.count({ where: { status: ComplaintStatus.NEW } }),
    ]);

    // Shu oyda tark etganlar
    const leftThisMonth = await this.studentsRepo
      .createQueryBuilder('s')
      .where('s.status = :status', { status: StudentStatus.LEFT })
      .andWhere('s.leftDate BETWEEN :start AND :end', { start: firstDay, end: lastDay })
      .getCount();

    // Shu oylik umumiy to'lovlar summasi
    const revenueResult = await this.paymentsRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.month = :month', { month: currentMonth })
      .getRawOne();
    const monthlyRevenue = parseFloat(revenueResult?.total || '0');

    return {
      totalStudents,
      totalTeachers,
      totalGroups,
      newComplaints,
      leftThisMonth,
      monthlyRevenue,
    };
  }

  /**
   * Figma: Oylik grafik — "2022-YIL Aprel oyigacha bo'lgan statistika"
   * So'nggi 7 oy uchun o'quvchilar va tark etganlar statistikasi
   * Har bir oy uchun to'g'ri hisoblash
   */
  async getMonthlyChart() {
    const now = new Date();

    const months = await Promise.all(
      Array.from({ length: 7 }, (_, i) => 6 - i).map(async (offset) => {
        const date     = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const year     = date.getFullYear();
        const monthNum = date.getMonth();
        const monthStr = String(monthNum + 1).padStart(2, '0');
        const label    = `${year}-${monthStr}`;

        const firstDay = new Date(year, monthNum, 1);
        const lastDay  = new Date(year, monthNum + 1, 0, 23, 59, 59);

        const [totalStudents, leftStudents, revenueResult] = await Promise.all([
          // O'sha oyning oxirigacha ro'yxatda bo'lgan barcha o'quvchilar
          this.studentsRepo
            .createQueryBuilder('s')
            .where('s.createdAt <= :lastDay', { lastDay })
            .andWhere(
              '(s.status != :left OR s.leftDate > :lastDay)',
              { left: StudentStatus.LEFT, lastDay },
            )
            .getCount(),
          // O'sha oyda tark etganlar
          this.studentsRepo
            .createQueryBuilder('s')
            .where('s.status = :status', { status: StudentStatus.LEFT })
            .andWhere('s.leftDate BETWEEN :start AND :end', { start: firstDay, end: lastDay })
            .getCount(),
          // Oylik daromad
          this.paymentsRepo
            .createQueryBuilder('p')
            .select('SUM(p.amount)', 'total')
            .where('p.month = :label', { label })
            .getRawOne(),
        ]);

        return {
          month: label,
          label: MONTH_NAMES[monthNum],   // "Yanvar", "Fevral" ... (Figma da shunday)
          totalStudents,
          leftStudents,
          revenue: parseFloat(revenueResult?.total || '0'),
        };
      }),
    );

    return months;
  }
}
