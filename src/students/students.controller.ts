import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, ParseIntPipe, Query,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Student } from './student.entity';

@ApiTags("Students (O'quvchilar)")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: "Yangi o'quvchi qo'shish" })
  @ApiResponse({ status: 201, type: Student })
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @ApiOperation({ summary: "Barcha o'quvchilar (qidiruv va guruh filtri bilan)" })
  @ApiQuery({ name: 'groupId', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, description: "Ism yoki telefon bo'yicha qidiruv" })
  @ApiResponse({ status: 200, type: [Student] })
  findAll(
    @Query('groupId') groupId?: number,
    @Query('search') search?: string,
  ) {
    if (groupId) return this.studentsService.findByGroup(+groupId);
    return this.studentsService.findAll(search);
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @ApiOperation({ summary: "O'quvchini ID bo'yicha olish" })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: "O'quvchi ma'lumotlarini yangilash" })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: "O'quvchini o'chirish (faqat superadmin)" })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id);
  }
}
