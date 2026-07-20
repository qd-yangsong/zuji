import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ShareService {
  constructor(private prisma: PrismaService) {}

  // 公开查看地点信息（不需要登录）
  // 返回地点基本信息 + 标签，不返回 userId 等隐私字段
  // 过滤被拒绝的内容，不通过分享接口暴露
  async getSharedPlace(placeId: string) {
    const place = await this.prisma.place.findFirst({
      where: { id: placeId, reviewStatus: { not: 'rejected' } },
      select: {
        id: true,
        realName: true,
        customName: true,
        latitude: true,
        longitude: true,
        address: true,
        coverImage: true,
        checkinCount: true,
        collectedAt: true,
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, type: true, isSystem: true },
            },
          },
        },
      },
    });
    if (!place) throw new NotFoundException('地点不存在或已被删除');

    return {
      ...place,
      tags: place.tags.map((pt) => pt.tag),
    };
  }

  // 公开查看合集信息（不需要登录）
  async getSharedCollection(collectionId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      select: {
        id: true,
        name: true,
        description: true,
        coverImage: true,
        createdAt: true,
        places: {
          orderBy: { sort: 'asc' },
          select: {
            place: {
              select: {
                id: true,
                realName: true,
                customName: true,
                latitude: true,
                longitude: true,
                address: true,
                coverImage: true,
                checkinCount: true,
              },
            },
          },
        },
      },
    });
    if (!collection) throw new NotFoundException('合集不存在或已被删除');

    return {
      ...collection,
      places: collection.places.map((cp) => cp.place),
    };
  }

  // 公开查看路线信息（不需要登录）
  async getSharedRoute(routeId: string) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      select: {
        id: true,
        name: true,
        description: true,
        coverImage: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        places: {
          orderBy: { sortOrder: 'asc' },
          select: {
            sortOrder: true,
            dayLabel: true,
            notes: true,
            place: {
              select: {
                id: true,
                realName: true,
                customName: true,
                latitude: true,
                longitude: true,
                address: true,
                coverImage: true,
                checkinCount: true,
              },
            },
          },
        },
      },
    });
    if (!route) throw new NotFoundException('路线不存在或已被删除');

    return {
      ...route,
      places: route.places.map((rp) => ({
        ...rp.place,
        sortOrder: rp.sortOrder,
        dayLabel: rp.dayLabel,
        notes: rp.notes,
      })),
    };
  }
}
