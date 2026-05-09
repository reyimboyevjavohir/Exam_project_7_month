import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '../common/enums/role.enum';
import { User } from './user.entity';

@ApiTags('Users (Foydalanuvchilar)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Yangi foydalanuvchi qo\'shish (faqat superadmin)' })
  @ApiResponse({ status: 201, description: 'Foydalanuvchi yaratildi', type: User })
  create(@Body() createUserDto: CreateUserDto, @GetUser() currentUser: User) {
    return this.usersService.create(createUserDto, currentUser.role);
  }

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Barcha foydalanuvchilarni olish' })
  @ApiResponse({ status: 200, type: [User] })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('admins')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Barcha adminlarni ko\'rish (faqat superadmin)' })
  @ApiResponse({ status: 200, type: [User] })
  findAdmins() {
    return this.usersService.findAdmins();
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'ID bo\'yicha foydalanuvchini olish' })
  @ApiResponse({ status: 200, type: User })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Foydalanuvchini yangilash (faqat superadmin)' })
  @ApiResponse({ status: 200, type: User })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Foydalanuvchini o\'chirish (faqat superadmin)' })
  @ApiResponse({ status: 200, description: 'O\'chirildi' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() currentUser: User,
  ) {
    return this.usersService.remove(id, currentUser.role);
  }

  @Patch(':id/toggle-active')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Foydalanuvchi faolligini o\'zgartirish' })
  @ApiResponse({ status: 200, type: User })
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.toggleActive(id);
  }
}
