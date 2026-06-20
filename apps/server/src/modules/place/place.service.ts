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

  // 创建地点
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
        tags: {
          create: allTagIds.map((tagId) => ({ tagId })),
        },
      },
      include: { tags: { include: { tag: true } } },
    });
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
}
