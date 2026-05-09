import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Student } from '../students/student.entity';
import { Group } from '../groups/group.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

@Entity('attendance')
export class Attendance {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '2024-01-15' })
  @Column({ type: 'date' })
  date: Date;

  @ApiProperty({ enum: AttendanceStatus })
  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  status: AttendanceStatus;

  @ApiProperty({ example: 'Kasalligi sababli' })
  @Column({ nullable: true })
  note: string;

  @ManyToOne(() => Student, (student) => student.attendances)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: number;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column()
  groupId: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
