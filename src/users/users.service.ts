import {
  Injectable, NotFoundException,
  ConflictException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, AuthProvider } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  // ── Create (local) ───────────────────────────────────────────────
  async create(dto: CreateUserDto, creatorRole?: Role): Promise<User> {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Bu email allaqachon mavjud');

    if (dto.role === Role.ADMIN && creatorRole !== Role.SUPERADMIN)
      throw new ForbiddenException('Faqat superadmin admin qo\'sha oladi');

    const hash = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : undefined;

    const user = this.repo.create({ ...dto, password: hash });
    return this.repo.save(user);
  }

  // ── Create (OAuth) ───────────────────────────────────────────────
  async createOAuthUser(data: {
    fullName:   string;
    email:      string;
    provider:   AuthProvider;
    providerId: string;
    avatar?:    string;
    role?:      Role;
  }): Promise<User> {
    const user = this.repo.create({
      fullName:   data.fullName,
      email:      data.email,
      provider:   data.provider,
      providerId: data.providerId,
      avatar:     data.avatar,
      role:       data.role ?? Role.USER,
    });
    return this.repo.save(user);
  }

  // ── Update OAuth info ────────────────────────────────────────────
  async updateOAuthInfo(
    id: number,
    data: { providerId: string; provider: AuthProvider; avatar?: string },
  ): Promise<User> {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  // ── Finders ──────────────────────────────────────────────────────
  findAll(): Promise<User[]> {
    return this.repo.find({
      select: ['id', 'fullName', 'email', 'phone', 'role', 'provider', 'avatar', 'isActive', 'createdAt'],
    });
  }

  findAdmins(): Promise<User[]> {
    return this.repo.find({
      where: { role: Role.ADMIN },
      select: ['id', 'fullName', 'email', 'phone', 'isActive', 'createdAt'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.repo.findOne({
      where: { id },
      select: ['id', 'fullName', 'email', 'phone', 'role', 'provider', 'avatar', 'isActive', 'createdAt'],
    });
    if (!user) throw new NotFoundException(`User #${id} topilmadi`);
    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  findByProviderId(providerId: string, provider: AuthProvider): Promise<User | null> {
    return this.repo.findOne({ where: { providerId, provider } });
  }

  // ── Update ───────────────────────────────────────────────────────
  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  // ── Delete ───────────────────────────────────────────────────────
  async remove(id: number, requesterRole: Role): Promise<{ message: string }> {
    const user = await this.findOne(id);
    if (user.role === Role.ADMIN && requesterRole !== Role.SUPERADMIN)
      throw new ForbiddenException('Faqat superadmin adminni o\'chira oladi');
    if (user.role === Role.SUPERADMIN)
      throw new ForbiddenException('Superadminni o\'chirib bo\'lmaydi');
    await this.repo.delete(id);
    return { message: 'Foydalanuvchi o\'chirildi' };
  }

  // ── Toggle ───────────────────────────────────────────────────────
  async toggleActive(id: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} topilmadi`);
    user.isActive = !user.isActive;
    return this.repo.save(user);
  }
}
