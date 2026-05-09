import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, ParseIntPipe, Query,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto } from './dto/group.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Group } from './group.entity';

@ApiTags('Groups (Guruhlar)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Yangi guruh yaratish' })
  @ApiResponse({ status: 201, type: Group })
  create(@Body() dto: CreateGroupDto) {
    return this.groupsService.create(dto);
  }

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Barcha guruhlar (qidiruv bilan)' })
  @ApiQuery({ name: 'search', required: false, description: 'Guruh nomi yoki yo\'nalish bo\'yicha qidiruv' })
  @ApiResponse({ status: 200, type: [Group] })
  findAll(@Query('search') search?: string) {
    return this.groupsService.findAll(search);
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Guruhni ID bo\'yicha olish' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findOne(id);
  }

  /**
   * Figma: "Informatika guruhi ro'yhati" sahifasi
   * Guruhga tegishli barcha o'quvchilar + shu oyda to'lov holati (checkbox)
   */
  @Get(':id/students')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: "Guruh o'quvchilari ro'yhati (to'lov holati bilan)",
    description: "Har bir o'quvchi uchun shu oyda to'lov qilgan/qilmaganligini qaytaradi",
  })
  getGroupStudents(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.getGroupStudents(id);
  }

  /**
   * Figma: "Shu oy bo'yicha to'lov qilmaganlar" ro'yhati
   */
  @Get(':id/unpaid-students')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: "Shu oyda to'lov qilmagan o'quvchilar",
    description: "Joriy oy bo'yicha to'lov qilmagan faol o'quvchilar ro'yhati",
  })
  getUnpaidStudents(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.getUnpaidStudents(id);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Guruhni yangilash' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGroupDto) {
    return this.groupsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: "Guruhni o'chirish (faqat superadmin)" })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.remove(id);
  }
}
