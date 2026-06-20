import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ConfigService {
  constructor(private prisma: PrismaService) {}

  // 获取当前生效的主题配置（公开接口，小程序端调用）
  async getActiveTheme() {
    const theme = await this.prisma.themeConfig.findFirst({
      where: { isActive: true },
      select: { version: true, config: true, updatedAt: true },
    });
    // 未配置时返回默认空配置
    return theme || { version: 'default', config: [], updatedAt: null };
  }

  // 获取当前生效的公告（公开接口，小程序端调用）
  async getActiveAnnouncements() {
    const now = new Date();
    return this.prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [
          { startAt: null, endAt: null },
          { startAt: { lte: now }, endAt: null },
          { startAt: null, endAt: { gte: now } },
          { startAt: { lte: now }, endAt: { gte: now } },
        ],
      },
      orderBy: { publishedAt: 'desc' },
    });
  }
}
