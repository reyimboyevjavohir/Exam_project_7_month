import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto, AuthResponseDto } from './dto/auth.dto';
import { CreateUserDto } from '../users/dto/user.dto';
import { Role } from '../common/enums/role.enum';
import { AuthProvider } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // ── Email + Parol bilan kirish ───────────────────────────────────
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Email yoki parol noto\'g\'ri');

    if (user.provider !== AuthProvider.LOCAL || !user.password)
      throw new UnauthorizedException(
        `Bu akkaunt ${user.provider} orqali ro'yxatdan o'tgan. OAuth bilan kiring.`,
      );

    const isValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Email yoki parol noto\'g\'ri');

    if (!user.isActive) throw new UnauthorizedException('Akkaunt bloklangan');

    return this._buildToken(user);
  }

  // ── Google / GitHub OAuth validate ──────────────────────────────
  async validateOAuthUser(profile: {
    providerId: string;
    provider:   string;
    email:      string;
    fullName:   string;
    avatar?:    string;
  }) {
    // 1. Avval providerId bo'yicha qidirish
    let user = await this.usersService.findByProviderId(
      profile.providerId,
      profile.provider as AuthProvider,
    );

    // 2. Email bo'yicha qidirish (birinchi marta kirsa)
    if (!user) {
      user = await this.usersService.findByEmail(profile.email);
    }

    // 3. Yangi user yaratish
    if (!user) {
      user = await this.usersService.createOAuthUser({
        fullName:   profile.fullName,
        email:      profile.email,
        provider:   profile.provider as AuthProvider,
        providerId: profile.providerId,
        avatar:     profile.avatar,
        role:       Role.USER,
      });
    } else {
      // Mavjud userni yangilash
      user = await this.usersService.updateOAuthInfo(user.id, {
        providerId: profile.providerId,
        provider:   profile.provider as AuthProvider,
        avatar:     profile.avatar,
      });
    }

    return user;
  }

  // ── OAuth dan keyin JWT qaytarish ───────────────────────────────
  async oauthLogin(user: any): Promise<AuthResponseDto> {
    return this._buildToken(user);
  }

  // ── Profile ─────────────────────────────────────────────────────
  async getProfile(userId: number) {
    return this.usersService.findOne(userId);
  }

  // ── SuperAdmin seed ─────────────────────────────────────────────
  async seedSuperAdmin(): Promise<void> {
    const existing = await this.usersService.findByEmail('superadmin@crm.uz');
    if (!existing) {
      const dto: CreateUserDto = {
        fullName: 'Super Admin',
        email:    'superadmin@crm.uz',
        password: 'SuperAdmin123',
        role:     Role.SUPERADMIN,
      };
      await this.usersService.create(dto);
      console.log('✅ SuperAdmin: superadmin@crm.uz / SuperAdmin123');
    }
  }

  // ── Helper ──────────────────────────────────────────────────────
  private _buildToken(user: any): AuthResponseDto {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id:       user.id,
        fullName: user.fullName,
        email:    user.email,
        role:     user.role,
        avatar:   user.avatar ?? null,
        provider: user.provider,
      },
    };
  }
}
