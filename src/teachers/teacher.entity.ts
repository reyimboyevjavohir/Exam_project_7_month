import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Group } from '../groups/group.entity';

@Entity('teachers')
export class Teacher {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Alisher Karimov' })
  @Column()
  fullName: string;

  @ApiProperty({ example: '+998901234567' })
  @Column()
  phone: string;

  @ApiProperty({ example: 'Matematika' })
  @Column()
  subject: string;

  @ApiProperty({ example: 'alisher@gmail.com' })
  @Column({ nullable: true })
  email: string;

  @ApiProperty({ example: 5 })
  @Column({ nullable: true })
  experienceYears: number;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Group, (group) => group.teacher)
  groups: Group[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
