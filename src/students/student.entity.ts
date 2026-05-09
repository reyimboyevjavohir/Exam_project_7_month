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
import { Group } from '../groups/group.entity';
import { Payment } from '../payments/payment.entity';
import { Attendance } from '../attendance/attendance.entity';

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LEFT = 'left',
}

@Entity('students')
export class Student {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Bobur Toshmatov' })
  @Column()
  fullName: string;

  @ApiProperty({ example: '+998901234567' })
  @Column()
  phone: string;

  @ApiProperty({ example: '+998907654321' })
  @Column({ nullable: true })
  parentPhone: string;

  @ApiProperty({ example: '2005-03-15' })
  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @ApiProperty({ enum: StudentStatus, example: StudentStatus.ACTIVE })
  @Column({ type: 'enum', enum: StudentStatus, default: StudentStatus.ACTIVE })
  status: StudentStatus;

  @ApiProperty({ example: '2024-01-01' })
  @Column({ type: 'date', nullable: true })
  leftDate: Date;

  @ApiProperty({ example: 'Uyga ko\'chib ketdi' })
  @Column({ nullable: true })
  leftReason: string;

  @ManyToOne(() => Group, (group) => group.students, { nullable: true })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column({ nullable: true })
  groupId: number;

  @OneToMany(() => Payment, (payment) => payment.student)
  payments: Payment[];

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendances: Attendance[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
