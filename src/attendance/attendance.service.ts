import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './attendance.entity';
import { BulkAttendanceDto, CreateAttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async create(dto: CreateAttendanceDto): Promise<Attendance> {
    // Bir kunda bir o'quvchi uchun duplicate yozuv oldini olish
    const existing = await this.attendanceRepository.findOne({
      where: {
        studentId: dto.studentId,
        groupId: dto.groupId,
        date: new Date(dto.date) as any,
      },
    });

    if (existing) {
      // Mavjud bo'lsa yangilash (upsert)
      Object.assign(existing, { status: dto.status, note: dto.note });
      return this.attendanceRepository.save(existing);
    }

    const record = this.attendanceRepository.create(dto);
    return this.attendanceRepository.save(record);
  }

  /**
   * Guruh uchun toplu davomat — bir kunda barchasi
   * Figma: "Saqlash" tugmasi bosilganda chaqiriladi
   * Agar o'sha kun uchun yozuv allaqachon mavjud bo'lsa, yangilaydi
   */
  async bulkCreate(dto: BulkAttendanceDto): Promise<Attendance[]> {
    const date = new Date(dto.date);

    // Bir kunda yozish uchun amallarni parallel bajarish
    const results = await Promise.all(
      dto.records.map(async (r) => {
        const existing = await this.attendanceRepository.findOne({
          where: {
            studentId: r.studentId,
            groupId: dto.groupId,
            date: date as any,
          },
        });

        if (existing) {
          // Mavjud yozuvni yangilash
          existing.status = r.status;
          existing.note = r.note ?? existing.note;
          return this.attendanceRepository.save(existing);
        }

        const record = this.attendanceRepository.create({
          date,
          groupId: dto.groupId,
          studentId: r.studentId,
          status: r.status,
          note: r.note,
        });
        return this.attendanceRepository.save(record);
      }),
    );

    return results;
  }

  findByGroup(groupId: number, date?: string): Promise<Attendance[]> {
    const query = this.attendanceRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.student', 'student')
      .where('a.groupId = :groupId', { groupId });

    if (date) query.andWhere('a.date = :date', { date });

    return query.orderBy('a.date', 'DESC').addOrderBy('student.fullName', 'ASC').getMany();
  }

  findByStudent(studentId: number): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { studentId },
      order: { date: 'DESC' },
    });
  }

  /**
   * Guruh davomati — muayyan kun kesimida kim kelgan/kelmagan
   * Figma: "Darsga kelmaganlar" ro'yxati
   */
  async getAbsentByGroupAndDate(groupId: number, date: string) {
    return this.attendanceRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.student', 'student')
      .where('a.groupId = :groupId', { groupId })
      .andWhere('a.date = :date', { date })
      .andWhere('a.status = :status', { status: 'absent' })
      .orderBy('student.fullName', 'ASC')
      .getMany();
  }

  async remove(id: number): Promise<{ message: string }> {
    const record = await this.attendanceRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException(`Davomat #${id} topilmadi`);
    await this.attendanceRepository.remove(record);
    return { message: "Davomat o'chirildi" };
  }
}
