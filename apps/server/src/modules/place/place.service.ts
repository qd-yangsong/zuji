import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TagService } from '../tag/tag.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { QueryPlaceDto } from './dto/query-place.dto';

@Injectable()
export class PlaceService {
  constructor(
    private prisma: PrismaService,
    private tagService: TagService,
  ) {}

  // 创建地点（支持「收藏即记录」）
  async create(dto: CreatePlaceDto, userId: string) {
    const allTagIds = [...dto.attributeTagIds, ...dto.sceneTagIds];
    const place = await this.prisma.place.create({
      data: {
        userId,
        realName: dto.realName,
        customName: dto.customName,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        coverImage: dto.coverImage,
        firstImpression: dto.firstImpression,
        firstImages: dto.firstImages || [],
        rating: dto.rating,
        wantToRevisit: dto.wantToRevisit || false,
        tags: {
          create: allTagIds.map((tagId) => ({ tagId })),
        },
      },
      include: { tags: { include: { tag: true } } },
    });

    // 如果有首次感受，同时创建一条打卡记录
    if (dto.firstImpression || (dto.firstImages && dto.firstImages.length > 0)) {
      await this.prisma.checkIn.create({
        data: {
          placeId: place.id,
          userId,
          content: dto.firstImpression || null,
          images: dto.firstImages || [],
          isFirst: true,
        },
      });
      // 更新打卡计数
      await this.prisma.place.update({
        where: { id: place.id },
        data: { checkinCount: { increment: 1 } },
      });
    }

    // 增加标签使用次数
    await this.tagService.incrementUsage(allTagIds);
    return this.toDto(place);
  }

  // 查询当前用户的地点列表
  async findAll(userId: string, query: QueryPlaceDto) {
    const sort = query.sort || 'recent';
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const sortFieldMap: Record<string, string> = {
      recent: 'createdAt',
      date: 'collectedAt',
      checkin: 'checkinCount',
    };

    const places = await this.prisma.place.findMany({
      where: {
        userId,
        ...(query.tagId ? { tags: { some: { tagId: query.tagId } } } : {}),
      },
      orderBy: sort === 'year'
        ? [{ collectedAt: 'desc' }]
        : [{ [sortFieldMap[sort] || 'createdAt']: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { tags: { include: { tag: true } } },
    });

    const total = await this.prisma.place.count({
      where: {
        userId,
        ...(query.tagId ? { tags: { some: { tagId: query.tagId } } } : {}),
      },
    });

    return {
      list: places.map((p) => this.toDto(p)),
      total,
      page,
      pageSize,
    };
  }

  // 获取单个地点详情
  async findOne(placeId: string, userId: string) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
      include: { tags: { include: { tag: true } } },
    });
    if (!place) throw new NotFoundException('地点不存在');
    if (place.userId !== userId) throw new ForbiddenException('无权访问他人地点');
    return this.toDto(place);
  }

  // 更新地点
  async update(placeId: string, dto: Partial<CreatePlaceDto>, userId: string) {
    const place = await this.prisma.place.findUnique({ where: { id: placeId } });
    if (!place) throw new NotFoundException('地点不存在');
    if (place.userId !== userId) throw new ForbiddenException('无权修改他人地点');

    const { attributeTagIds, sceneTagIds, ...placeData } = dto;
    const allTagIds = [...(attributeTagIds || []), ...(sceneTagIds || [])];

    await this.prisma.place.update({
      where: { id: placeId },
      data: placeData,
    });

    // 如果传了标签，重建关联
    if (allTagIds.length > 0) {
      await this.prisma.placeTag.deleteMany({ where: { placeId } });
      await this.prisma.placeTag.createMany({
        data: allTagIds.map((tagId) => ({ placeId, tagId })),
      });
    }

    return this.findOne(placeId, userId);
  }

  // 删除地点
  async remove(placeId: string, userId: string) {
    const place = await this.prisma.place.findUnique({ where: { id: placeId } });
    if (!place) throw new NotFoundException('地点不存在');
    if (place.userId !== userId) throw new ForbiddenException('无权删除他人地点');
    await this.prisma.place.delete({ where: { id: placeId } });
    return { ok: true };
  }

  // 转换为 DTO（扁平化标签：PlaceTag[] → Tag[]）
  private toDto(place: any) {
    return {
      ...place,
      tags: place.tags?.map((pt: any) => pt.tag) || [],
    };
  }

  // 获取旅程地图标记点（所有有打卡记录的地点）
  async getJourneyMarkers(userId: string) {
    const places = await this.prisma.place.findMany({
      where: {
        userId,
        checkinCount: { gt: 0 },
      },
      select: {
        id: true,
        customName: true,
        realName: true,
        latitude: true,
        longitude: true,
        checkinCount: true,
        checkins: {
          orderBy: { checkinAt: 'desc' },
          take: 1,
          select: { checkinAt: true },
        },
      },
    });

    return places.map((p) => ({
      placeId: p.id,
      customName: p.customName,
      realName: p.realName,
      latitude: p.latitude,
      longitude: p.longitude,
      checkinCount: p.checkinCount,
      lastCheckinAt: p.checkins[0]?.checkinAt || null,
    }));
  }

  // 模糊搜索地点（名称 + 标签）
  async search(userId: string, keyword: string) {
    if (!keyword || keyword.trim().length === 0) return [];

    const keywordLower = keyword.trim().toLowerCase();

    // 先按名称搜索，再按标签搜索，合并去重
    const byName = await this.prisma.place.findMany({
      where: {
        userId,
        OR: [
          { realName: { contains: keyword, mode: 'insensitive' } },
          { customName: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      include: { tags: { include: { tag: true } } },
      orderBy: { checkinCount: 'desc' },
      take: 20,
    });

    const nameIds = new Set(byName.map((p) => p.id));

    const byTag = await this.prisma.place.findMany({
      where: {
        userId,
        tags: { some: { tag: { name: { contains: keyword, mode: 'insensitive' } } } },
        id: { notIn: Array.from(nameIds) },
      },
      include: { tags: { include: { tag: true } } },
      orderBy: { checkinCount: 'desc' },
      take: 10,
    });

    return [...byName, ...byTag].map((p) => this.toDto(p));
  }

  // 查找附近已收藏的地点（用于「记录」Tab 的自动匹配）
  async findNearby(userId: string, latitude: number, longitude: number, radiusMeters: number = 100) {
    // 简化经纬度范围计算：1 度纬度 ≈ 111,320 米，1 度经度 ≈ 111,320 * cos(lat) 米
    const latDelta = radiusMeters / 111320;
    const lonDelta = radiusMeters / (111320 * Math.cos((latitude * Math.PI) / 180));

    const places = await this.prisma.place.findMany({
      where: {
        userId,
        latitude: { gte: latitude - latDelta, lte: latitude + latDelta },
        longitude: { gte: longitude - lonDelta, lte: longitude + lonDelta },
      },
      include: {
        tags: { include: { tag: true } },
        checkins: {
          orderBy: { checkinAt: 'desc' },
          take: 1,
          select: { checkinAt: true },
        },
      },
      take: 5,
    });

    // 精确计算距离，过滤出真正在半径内的地点
    return places
      .map((p) => {
        const distance = this.haversineDistance(latitude, longitude, p.latitude, p.longitude);
        return { ...p, distance: Math.round(distance) };
      })
      .filter((p) => p.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance)
      .map((p) => ({
        placeId: p.id,
        customName: p.customName,
        realName: p.realName,
        latitude: p.latitude,
        longitude: p.longitude,
        distance: p.distance,
        checkinCount: p.checkinCount,
        lastCheckinAt: p.checkins[0]?.checkinAt || null,
        tags: p.tags?.map((pt: any) => pt.tag) || [],
      }));
  }

  // 获取旅程时间线（用于发现页）
  async getTimeline(userId: string, year?: number) {
    const where: any = { userId };
    if (year) {
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);
      where.checkinAt = { gte: startDate, lt: endDate };
    }

    const checkins = await this.prisma.checkIn.findMany({
      where,
      orderBy: { checkinAt: 'desc' },
      include: {
        place: {
          select: {
            id: true,
            customName: true,
            realName: true,
            latitude: true,
            longitude: true,
            coverImage: true,
          },
        },
      },
      take: 50,
    });

    return checkins.map((c) => ({
      id: c.id,
      placeId: c.placeId,
      placeName: c.place.customName || c.place.realName,
      latitude: c.place.latitude,
      longitude: c.place.longitude,
      coverImage: c.place.coverImage,
      content: c.content,
      images: c.images,
      isFirst: c.isFirst,
      checkinAt: c.checkinAt,
    }));
  }

  // 年度足迹总结
  async getYearSummary(userId: string, year: number) {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    const [placeCount, checkinCount, topTag] = await Promise.all([
      this.prisma.place.count({ where: { userId, collectedAt: { gte: startDate, lt: endDate } } }),
      this.prisma.checkIn.count({ where: { userId, checkinAt: { gte: startDate, lt: endDate } } }),
      this.prisma.placeTag.findFirst({
        where: { place: { userId, collectedAt: { gte: startDate, lt: endDate } } },
        select: { tag: { select: { id: true, name: true } } },
        orderBy: { place: { checkinCount: 'desc' } },
      }),
    ]);

    // 最活跃月份：统计每月打卡次数
    const monthlyCheckins = await this.prisma.$queryRaw<{ month: number; count: bigint }[]>`
      SELECT EXTRACT(MONTH FROM "checkinAt")::int AS month, COUNT(*)::bigint AS count
      FROM checkins
      WHERE "userId" = ${userId}
        AND "checkinAt" >= ${startDate}
        AND "checkinAt" < ${endDate}
      GROUP BY month
      ORDER BY count DESC
      LIMIT 1
    `;

    // 最新打卡的地点数
    const uniquePlaceCount = await this.prisma.checkIn.groupBy({
      by: ['placeId'],
      where: { userId, checkinAt: { gte: startDate, lt: endDate } },
    });

    // 打卡过的路线数
    const routeCount = await this.prisma.route.count({
      where: { userId, type: 'journey', createdAt: { gte: startDate, lt: endDate } },
    });

    return {
      year,
      placeCount,
      checkinCount,
      uniquePlaceCount: uniquePlaceCount.length,
      routeCount,
      topMonth: monthlyCheckins[0]?.month ? Number(monthlyCheckins[0].month) : null,
      topTag: topTag ? { id: topTag.tag.id, name: topTag.tag.name } : null,
    };
  }

  // Haversine 公式计算两点距离（米）
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // 地球半径（米）
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
