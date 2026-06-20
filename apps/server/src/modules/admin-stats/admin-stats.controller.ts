import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminStatsService } from './admin-stats.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AdminGuard } from '../../common/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminStatsController {
  constructor(
    private readonly statsService: AdminStatsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('stats/overview')
  getOverview() {
    return this.statsService.getOverview();
  }

  @Get('stats/trends')
  getTrends() {
    return this.statsService.getTrends();
  }

  @Get('stats/tags')
  getTagStats() {
    return this.statsService.getTagStats();
  }

  @Get('logs')
  async getLogs(
    @Query('adminId') adminId?: string,
    @Query('action') action?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const where: any = {};
    if (adminId) where.adminId = adminId;
    if (action) where.action = action;
    const p = Number(page) || 1;
    const ps = Number(pageSize) || 20;
    const [items, total] = await Promise.all([
      this.prisma.adminLog.findMany({
        where,
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.adminLog.count({ where }),
    ]);
    return { items, total, page: p, pageSize: ps };
  }
}
