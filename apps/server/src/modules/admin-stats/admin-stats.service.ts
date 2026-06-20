import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminStatsService {
  constructor(private prisma: PrismaService) {}

  // 核心指标概览：用户/地点/打卡/合集总数 + 今日新增
  async getOverview() {
    const [userCount, placeCount, checkinCount, collectionCount, todayNewUsers, todayNewPlaces, todayNewCheckins] =
      await Promise.all([
        this.prisma.user.count({ where: { role: 'user' } }),
        this.prisma.place.count(),
        this.prisma.checkIn.count(),
        this.prisma.collection.count(),
        this.prisma.user.count({ where: { role: 'user', createdAt: { gte: this.getTodayStart() } } }),
        this.prisma.place.count({ where: { createdAt: { gte: this.getTodayStart() } } }),
        this.prisma.checkIn.count({ where: { createdAt: { gte: this.getTodayStart() } } }),
      ]);
    return {
      userCount,
      placeCount,
      checkinCount,
      collectionCount,
      todayNewUsers,
      todayNewPlaces,
      todayNewCheckins,
    };
  }

  // 近 30 天趋势：按日期聚合用户/地点/打卡新增量
  async getTrends() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [users, places, checkins] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: 'user', createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
      }),
      this.prisma.place.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
      }),
      this.prisma.checkIn.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
      }),
    ]);

    // 按日期聚合，初始化近 30 天的日期桶
    const dateMap: Record<string, { users: number; places: number; checkins: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dateMap[key] = { users: 0, places: 0, checkins: 0 };
    }
    users.forEach((u) => {
      const key = u.createdAt.toISOString().split('T')[0];
      if (dateMap[key]) dateMap[key].users++;
    });
    places.forEach((p) => {
      const key = p.createdAt.toISOString().split('T')[0];
      if (dateMap[key]) dateMap[key].places++;
    });
    checkins.forEach((c) => {
      const key = c.createdAt.toISOString().split('T')[0];
      if (dateMap[key]) dateMap[key].checkins++;
    });

    return Object.entries(dateMap).map(([date, counts]) => ({ date, ...counts }));
  }

  // 标签使用排行：按 usageCount 降序取前 20
  async getTagStats() {
    const tags = await this.prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        usageCount: true,
        // Prisma 模型中 Tag 的关联名为 placeTags / checkinTags
        _count: { select: { placeTags: true, checkinTags: true } },
      },
      orderBy: { usageCount: 'desc' },
      take: 20,
    });
    return tags.map((t) => ({
      id: t.id,
      name: t.name,
      type: t.type,
      usageCount: t.usageCount,
      placeCount: t._count.placeTags,
      checkinCount: t._count.checkinTags,
    }));
  }

  private getTodayStart(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
