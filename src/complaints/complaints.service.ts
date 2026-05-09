import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Complaint, ComplaintStatus } from './complaint.entity';
import { CreateComplaintDto, UpdateComplaintDto } from './dto/complaint.dto';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private complaintsRepository: Repository<Complaint>,
  ) {}

  create(dto: CreateComplaintDto): Promise<Complaint> {
    const complaint = this.complaintsRepository.create(dto);
    return this.complaintsRepository.save(complaint);
  }

  findAll(): Promise<Complaint[]> {
    return this.complaintsRepository.find({
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Complaint> {
    const complaint = await this.complaintsRepository.findOne({
      where: { id },
      relations: ['student'],
    });
    if (!complaint) throw new NotFoundException(`Murojaat #${id} topilmadi`);
    return complaint;
  }

  async countNew(): Promise<number> {
    return this.complaintsRepository.count({ where: { status: ComplaintStatus.NEW } });
  }

  async update(id: number, dto: UpdateComplaintDto): Promise<Complaint> {
    const complaint = await this.findOne(id);
    Object.assign(complaint, dto);
    return this.complaintsRepository.save(complaint);
  }

  async remove(id: number): Promise<{ message: string }> {
    const complaint = await this.findOne(id);
    await this.complaintsRepository.remove(complaint);
    return { message: "Murojaat o'chirildi" };
  }

  /**
   * Figma: "Bugungi murojaatlar" + "26.03.2022 kungi murojaatlar"
   * Murojaatlarni sana bo'yicha guruhlash
   */
  async findGroupedByDate(): Promise<Record<string, Complaint[]>> {
    const complaints = await this.complaintsRepository.find({
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });

    const grouped: Record<string, Complaint[]> = {};
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0]; // YYYY-MM-DD

    for (const c of complaints) {
      const dateKey = c.createdAt.toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(c);
    }

    return grouped;
  }

  /**
   * Figma: "Bugungi murojaatlar" — faqat bugungi
   */
  async findToday(): Promise<Complaint[]> {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return this.complaintsRepository.find({
      where: { createdAt: Between(start, end) },
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Muayyan kun murojaatlari
   * ?date=2022-03-26
   */
  async findByDate(date: string): Promise<Complaint[]> {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

    return this.complaintsRepository.find({
      where: { createdAt: Between(start, end) },
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });
  }
}
