import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export enum AuthProvider {
  LOCAL    = 'local',
  GOOGLE   = 'google',
  GITHUB   = 'github',
}

@Entity('users')
export class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'John Doe' })
  @Column()
  fullName: string;

  @ApiProperty({ example: 'admin@crm.uz' })
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;           // OAuth userlar uchun null bo'lishi mumkin

  @ApiProperty({ example: '+998901234567' })
  @Column({ nullable: true })
  phone: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @ApiProperty({ enum: AuthProvider })
  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  provider: AuthProvider;

  @Column({ nullable: true })
  providerId: string;         // Google/GitHub dan kelgan ID

  @Column({ nullable: true })
  avatar: string;             // Google/GitHub profil rasmi

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
