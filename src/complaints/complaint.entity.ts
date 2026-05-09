import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Student } from '../students/student.entity';

export enum ComplaintStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

@Entity('complaints')
export class Complaint {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'To\'lov muammosi' })
  @Column()
  title: string;

  @ApiProperty({ example: 'To\'lovimni qabul qilishmadi' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ enum: ComplaintStatus })
  @Column({ type: 'enum', enum: ComplaintStatus, default: ComplaintStatus.NEW })
  status: ComplaintStatus;

  @ApiProperty({ example: 'Admin ko\'rib chiqmoqda' })
  @Column({ nullable: true, type: 'text' })
  adminResponse: string;

  @ApiProperty({ example: '+998901234567' })
  @Column()
  contactPhone: string;

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ nullable: true })
  studentId: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
