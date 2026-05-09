import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './teacher.entity';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teachersRepository: Repository<Teacher>,
  ) {}

  create(dto: CreateTeacherDto): Promise<Teacher> {
    const teacher = this.teachersRepository.create(dto);
    return this.teachersRepository.save(teacher);
  }

  findAll(): Promise<Teacher[]> {
    return this.teachersRepository.find({ relations: ['groups'] });
  }

  async findOne(id: number): Promise<Teacher> {
    const teacher = await this.teachersRepository.findOne({
      where: { id },
      relations: ['groups'],
    });
    if (!teacher) throw new NotFoundException(`O'qituvchi #${id} topilmadi`);
    return teacher;
  }

  async update(id: number, dto: UpdateTeacherDto): Promise<Teacher> {
    const teacher = await this.findOne(id);
    Object.assign(teacher, dto);
    return this.teachersRepository.save(teacher);
  }

  async remove(id: number): Promise<{ message: string }> {
    const teacher = await this.findOne(id);
    await this.teachersRepository.remove(teacher);
    return { message: 'O\'qituvchi o\'chirildi' };
  }

  async toggleActive(id: number): Promise<Teacher> {
    const teacher = await this.findOne(id);
    teacher.isActive = !teacher.isActive;
    return this.teachersRepository.save(teacher);
  }
}
