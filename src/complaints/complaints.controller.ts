import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, ParseIntPipe, Query,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto, UpdateComplaintDto } from './dto/complaint.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Complaint } from './complaint.entity';

@ApiTags('Complaints (Murojaatlar)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @ApiOperation({ summary: "Yangi murojaat qo'shish" })
  @ApiResponse({ status: 201, type: Complaint })
  create(@Body() dto: CreateComplaintDto) {
    return this.complaintsService.create(dto);
  }

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Barcha murojaatlar' })
  @ApiResponse({ status: 200, type: [Complaint] })
  findAll() {
    return this.complaintsService.findAll();
  }

  /**
   * Figma: "Bugungi murojaatlar" + o'tgan kunlar bo'yicha guruhlangan ko'rinish
   * grouped=true parametri bilan sana bo'yicha guruhlangan object qaytaradi
   */
  @Get('grouped')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({
    summary: "Murojaatlarni sana bo'yicha guruhlangan holda olish",
    description:
      "Figmadagi 'Bugungi murojaatlar' + '26.03.2022 kungi murojaatlar' ko'rinish uchun. " +
      "{ '2022-01-27': [...], '2022-03-26': [...] } formatida qaytaradi.",
  })
  findGroupedByDate() {
    return this.complaintsService.findGroupedByDate();
  }

  /**
   * Figma: "Bugungi murojaatlar" — badge uchun ham ishlatiladi
   */
  @Get('today')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: "Bugungi murojaatlar" })
  findToday() {
    return this.complaintsService.findToday();
  }

  /**
   * Muayyan sananing murojaatlari: ?date=2022-03-26
   */
  @Get('by-date')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: "Muayyan kun murojaatlari" })
  @ApiQuery({ name: 'date', required: true, example: '2022-03-26', description: 'YYYY-MM-DD format' })
  findByDate(@Query('date') date: string) {
    return this.complaintsService.findByDate(date);
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: "Murojaatni ID bo'yicha olish" })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.complaintsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Murojaat statusini yangilash / javob berish' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateComplaintDto) {
    return this.complaintsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: "Murojaatni o'chirish (faqat superadmin)" })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.complaintsService.remove(id);
  }
}
