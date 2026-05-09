import {
  Controller, Get, Post, Body, Param, Delete, UseGuards, ParseIntPipe, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { BulkAttendanceDto, CreateAttendanceDto } from './dto/attendance.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Attendance (Davomat)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @ApiOperation({ summary: "Bitta davomat qo'shish yoki yangilash (upsert)" })
  create(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.create(dto);
  }

  /**
   * Figma: "Saqlash" tugmasi — guruh uchun bir kunda barcha o'quvchilar davomati
   * Mavjud yozuvlar yangilanadi, yangilari qo'shiladi
   */
  @Post('bulk')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Guruh uchun davomat (bir kunda barchasi) — upsert',
    description:
      "Figmadagi 'Saqlash' tugmasi uchun. Mavjud yozuvlar yangilanadi, yangilari qo'shiladi.",
  })
  bulkCreate(@Body() dto: BulkAttendanceDto) {
    return this.attendanceService.bulkCreate(dto);
  }

  @Get('group/:groupId')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Guruh davomati (sana filtri bilan)' })
  @ApiQuery({ name: 'date', required: false, example: '2024-01-15', description: 'YYYY-MM-DD format' })
  findByGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('date') date?: string,
  ) {
    return this.attendanceService.findByGroup(groupId, date);
  }

  /**
   * Figma: "Darsga kelmaganlar" ro'yxati
   */
  @Get('group/:groupId/absent')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: "Guruhdan darsga kelmaganlar ro'yxati",
    description: "Figmadagi 'Darsga kelmaganlar' bo'limi uchun. date parametri majburiy.",
  })
  @ApiQuery({ name: 'date', required: true, example: '2024-01-15', description: 'YYYY-MM-DD format' })
  getAbsentStudents(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('date') date: string,
  ) {
    return this.attendanceService.getAbsentByGroupAndDate(groupId, date);
  }

  @Get('student/:studentId')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @ApiOperation({ summary: "O'quvchi davomati tarixi" })
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.attendanceService.findByStudent(studentId);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: "Davomatni o'chirish" })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.remove(id);
  }
}
