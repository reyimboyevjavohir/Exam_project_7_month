import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Dashboard (Xisobot)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({
    summary: 'Asosiy statistika',
    description: 'Jami o\'quvchilar, o\'qituvchilar, guruhlar, murojaatlar soni',
  })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('monthly-chart')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({
    summary: 'Oylik grafik ma\'lumotlari',
    description: 'So\'nggi 7 oy uchun o\'quvchilar va tark etganlar statistikasi',
  })
  getMonthlyChart() {
    return this.dashboardService.getMonthlyChart();
  }
}
