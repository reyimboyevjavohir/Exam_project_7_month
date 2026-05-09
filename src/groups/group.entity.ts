import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Teacher } from '../teachers/teacher.entity';
import { Student } from '../students/student.entity';

@Entity('groups')
export class Group {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'N-101' })
  @Column()
  name: string;

  @ApiProperty({ example: 'Matematik' })
  @Column()
  subject: string;

  @ApiProperty({ example: '09:00' })
  @Column()
  startTime: string;

  @ApiProperty({ example: '11:00' })
  @Column()
  endTime: string;

  @ApiProperty({ example: 'Dushanba, Chorshanba, Juma' })
  @Column()
  days: string;

  @ApiProperty({ example: 800000 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyFee: number;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Teacher, (teacher) => teacher.groups, { nullable: true })
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @Column({ nullable: true })
  teacherId: number;

  @OneToMany(() => Student, (student) => student.group)
  students: Student[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
