import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { ReorderPlacesDto } from './dto/reorder.dto';
import { AddPlaceDto } from './dto/add-place.dto';

@Injectable()
export class RouteService {
  constructor(private prisma: PrismaService) {}

  // 查询当前用户的所有路线（支持按 type 筛选）
  async findAll(userId: string, type?: string) {
    const routes = await this.prisma.route.findMany({
      where: { userId, ...(type ? { type } : {}) },
      orderBy: { createdAt: 'desc' },
      include: {
        places: {
          orderBy: { sortOrder: 'asc' },
          include: { place: { include: { tags: { include: { tag: true } } } } },
        },
      },
    });
    return routes.map((r) => this.toDto(r));
  }

  // 获取单个路线详情
  async findOne(routeId: string, userId: string) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: {
        places: {
          orderBy: { sortOrder: 'asc' },
          include: { place: { include: { tags: { include: { tag: true } } } } },
        },
      },
    });
    if (!route) throw new NotFoundException('路线不存在');
    if (route.userId !== userId) throw new ForbiddenException('无权访问他人路线');
    return this.toDto(route);
  }

  // 创建路线（合集或旅程）
  async create(dto: CreateRouteDto, userId: string) {
    const route = await this.prisma.route.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        coverImage: dto.coverImage,
        type: dto.type || 'collection',
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        ...(dto.placeIds && dto.placeIds.length > 0
          ? { places: { create: dto.placeIds.map((placeId, idx) => ({ placeId, sortOrder: idx })) } }
          : {}),
      },
      include: {
        places: {
          orderBy: { sortOrder: 'asc' },
          include: { place: { include: { tags: { include: { tag: true } } } } },
        },
      },
    });
    return this.toDto(route);
  }

  // 更新路线
  async update(routeId: string, dto: UpdateRouteDto, userId: string) {
    const route = await this.prisma.route.findUnique({ where: { id: routeId } });
    if (!route) throw new NotFoundException('路线不存在');
    if (route.userId !== userId) throw new ForbiddenException('无权修改他人路线');

    const { placeIds, ...routeData } = dto;
    const data: any = { ...routeData };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);

    await this.prisma.route.update({ where: { id: routeId }, data });

    // 如果传了 placeIds，重建关联
    if (placeIds !== undefined) {
      await this.prisma.routePlace.deleteMany({ where: { routeId } });
      if (placeIds.length > 0) {
        await this.prisma.routePlace.createMany({
          data: placeIds.map((placeId, idx) => ({ routeId, placeId, sortOrder: idx })),
        });
      }
    }

    return this.findOne(routeId, userId);
  }

  // 删除路线
  async remove(routeId: string, userId: string) {
    const route = await this.prisma.route.findUnique({ where: { id: routeId } });
    if (!route) throw new NotFoundException('路线不存在');
    if (route.userId !== userId) throw new ForbiddenException('无权删除他人路线');
    await this.prisma.route.delete({ where: { id: routeId } });
    return { ok: true };
  }

  // 添加地点到路线（增量，不重建）
  async addPlace(routeId: string, dto: AddPlaceDto, userId: string) {
    const route = await this.prisma.route.findUnique({ where: { id: routeId } });
    if (!route) throw new NotFoundException('路线不存在');
    if (route.userId !== userId) throw new ForbiddenException('无权操作他人路线');

    const place = await this.prisma.place.findUnique({ where: { id: dto.placeId } });
    if (!place) throw new NotFoundException('地点不存在');
    if (place.userId !== userId) throw new ForbiddenException('无权操作他人地点');

    // 获取当前最大排序值
    const lastItem = await this.prisma.routePlace.findFirst({
      where: { routeId },
      orderBy: { sortOrder: 'desc' },
    });
    const sortOrder = (lastItem?.sortOrder ?? -1) + 1;

    // upsert：已存在则更新备注，不存在则创建
    await this.prisma.routePlace.upsert({
      where: { routeId_placeId: { routeId, placeId: dto.placeId } },
      create: { routeId, placeId: dto.placeId, sortOrder, dayLabel: dto.dayLabel, notes: dto.notes },
      update: { dayLabel: dto.dayLabel, notes: dto.notes },
    });

    return this.findOne(routeId, userId);
  }

  // 从路线中移除地点
  async removePlace(routeId: string, placeId: string, userId: string) {
    const route = await this.prisma.route.findUnique({ where: { id: routeId } });
    if (!route) throw new NotFoundException('路线不存在');
    if (route.userId !== userId) throw new ForbiddenException('无权操作他人路线');

    await this.prisma.routePlace.deleteMany({ where: { routeId, placeId } });
    return { ok: true };
  }

  // 重排序路线中的地点
  async reorderPlaces(routeId: string, dto: ReorderPlacesDto, userId: string) {
    const route = await this.prisma.route.findUnique({ where: { id: routeId } });
    if (!route) throw new NotFoundException('路线不存在');
    if (route.userId !== userId) throw new ForbiddenException('无权操作他人路线');

    // 批量更新排序
    await Promise.all(
      dto.placeIds.map((placeId, idx) =>
        this.prisma.routePlace.updateMany({
          where: { routeId, placeId },
          data: { sortOrder: idx },
        }),
      ),
    );

    return this.findOne(routeId, userId);
  }

  // 标记旅程完成
  async completeJourney(routeId: string, userId: string) {
    const route = await this.prisma.route.findUnique({ where: { id: routeId } });
    if (!route) throw new NotFoundException('路线不存在');
    if (route.userId !== userId) throw new ForbiddenException('无权操作他人路线');
    if (route.type !== 'journey') throw new ForbiddenException('仅旅程类型可标记完成');

    await this.prisma.route.update({
      where: { id: routeId },
      data: { status: 'completed', endDate: new Date() },
    });

    return this.findOne(routeId, userId);
  }

  // 扁平化 places：RoutePlace[] → 有序的 Place[]
  private toDto(route: any) {
    return {
      ...route,
      places:
        route.places?.map((rp: any) => ({
          ...rp.place,
          tags: rp.place.tags?.map((pt: any) => pt.tag) || [],
          routeInfo: {
            sortOrder: rp.sortOrder,
            dayLabel: rp.dayLabel,
            notes: rp.notes,
          },
        })) || [],
    };
  }
}
