import {
  Controller, Post, Get, Body,
  UseGuards, Req, Res,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, AuthResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Auth (Autentifikatsiya)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── Email + Parol ────────────────────────────────────────────────
  @Post('login')
  @ApiOperation({ summary: 'Email + parol bilan kirish' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Noto\'g\'ri ma\'lumotlar' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ── Profile ──────────────────────────────────────────────────────
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Joriy foydalanuvchi profili' })
  @ApiResponse({ status: 200, type: User })
  getProfile(@GetUser() user: User) {
    return this.authService.getProfile(user.id);
  }

  // ── Google OAuth ─────────────────────────────────────────────────
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Google bilan kirish',
    description: 'Brauzerda oching: GET /api/auth/google',
  })
  @ApiResponse({ status: 302, description: 'Google login sahifasiga yo\'naltiradi' })
  googleAuth() {
    // Passport redirect qiladi — kod bu yerga kelmaydi
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiExcludeEndpoint()   // Swagger dan yashirish (foydalanuvchi ishlatmaydi)
  async googleCallback(@Req() req: any, @Res() res: any) {
    const result = await this.authService.oauthLogin(req.user);
    // Token ni URL orqali frontendga yuborish
    return res.redirect(
      `${process.env.APP_URL}/auth/success?token=${result.accessToken}`,
    );
  }

  // ── GitHub OAuth ─────────────────────────────────────────────────
  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({
    summary: 'GitHub bilan kirish',
    description: 'Brauzerda oching: GET /api/auth/github',
  })
  @ApiResponse({ status: 302, description: 'GitHub login sahifasiga yo\'naltiradi' })
  githubAuth() {
    // Passport redirect qiladi
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiExcludeEndpoint()
  async githubCallback(@Req() req: any, @Res() res: any) {
    const result = await this.authService.oauthLogin(req.user);
    return res.redirect(
      `${process.env.APP_URL}/auth/success?token=${result.accessToken}`,
    );
  }
}
