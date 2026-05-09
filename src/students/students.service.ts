import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Student, StudentStatus } from './student.entity';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  create(dto: CreateStudentDto): Promise<Student> {
    const student = this.studentsRepository.create(dto);
    return this.studentsRepository.save(student);
  }

  findAll(search?: string): Promise<Student[]> {
    if (search) {
      return this.studentsRepository.find({
        where: [
          { fullName: ILike(`%${search}%`) },
          { phone: ILike(`%${search}%`) },
        ],
        relations: ['group'],
      });
    }
    return this.studentsRepository.find({ relations: ['group'] });
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { id },
      relations: ['group', 'payments', 'attendances'],
    });
    if (!student) throw new NotFoundException(`O'quvchi #${id} topilmadi`);
    return student;
  }

  async findByGroup(groupId: number): Promise<Student[]> {
    return this.studentsRepository.find({
      where: { groupId, status: StudentStatus.ACTIVE },
      relations: ['group'],
    });
  }

  async update(id: number, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);
    Object.assign(student, dto);
    return this.studentsRepository.save(student);
  }

  async remove(id: number): Promise<{ message: string }> {
    const student = await this.findOne(id);
    await this.studentsRepository.remove(student);
    return { message: "O'quvchi o'chirildi" };
  }

  async countActive(): Promise<number> {
    return this.studentsRepository.count({ where: { status: StudentStatus.ACTIVE } });
  }

  async countLeftThisMonth(): Promise<number> {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return this.studentsRepository
      .createQueryBuilder('s')
      .where('s.status = :status', { status: StudentStatus.LEFT })
      .andWhere('s.leftDate BETWEEN :start AND :end', { start: firstDay, end: lastDay })
      .getCount();
  }
}
