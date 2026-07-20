import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionService {
  constructor(private prisma: PrismaService) {}

  // 查询当前用户的所有合集
  async findAll(userId: string) {
    const collections = await this.prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        places: { include: { place: { include: { tags: { include: { tag: true } } } } } },
      },
    });
    return collections.map((c) => this.toDto(c));
  }

  // 获取单个合集详情
  async findOne(collectionId: string, userId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        places: {
          orderBy: { sort: 'asc' },
          include: { place: { include: { tags: { include: { tag: true } } } } },
        },
      },
    });
    if (!collection) throw new NotFoundException('合集不存在');
    if (collection.userId !== userId) throw new ForbiddenException('无权访问他人合集');
    return this.toDto(collection);
  }

  // 创建合集
  async create(dto: CreateCollectionDto, userId: string) {
    const collection = await this.prisma.collection.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        coverImage: dto.coverImage,
        ...(dto.placeIds && dto.placeIds.length > 0
          ? { places: { create: dto.placeIds.map((placeId, idx) => ({ placeId, sort: idx })) } }
          : {}),
      },
      include: { places: { include: { place: { include: { tags: { include: { tag: true } } } } } } },
    });
    return this.toDto(collection);
  }

  // 更新合集（含地点列表重建）
  async update(collectionId: string, dto: UpdateCollectionDto, userId: string) {
    const collection = await this.prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('合集不存在');
    if (collection.userId !== userId) throw new ForbiddenException('无权修改他人合集');

    const { placeIds, ...collectionData } = dto;

    await this.prisma.collection.update({
      where: { id: collectionId },
      data: collectionData,
    });

    // 如果传了 placeIds，重建关联
    if (placeIds !== undefined) {
      await this.prisma.collectionPlace.deleteMany({ where: { collectionId } });
      if (placeIds.length > 0) {
        await this.prisma.collectionPlace.createMany({
          data: placeIds.map((placeId, idx) => ({ collectionId, placeId, sort: idx })),
        });
      }
    }

    return this.findOne(collectionId, userId);
  }

  // 删除合集
  async remove(collectionId: string, userId: string) {
    const collection = await this.prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('合集不存在');
    if (collection.userId !== userId) throw new ForbiddenException('无权删除他人合集');
    await this.prisma.collection.delete({ where: { id: collectionId } });
    return { ok: true };
  }

  // 添加地点到合集（增量添加，不影响已有关联）
  async addPlace(collectionId: string, placeId: string, userId: string) {
    const collection = await this.prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('合集不存在');
    if (collection.userId !== userId) throw new ForbiddenException('无权操作他人合集');

    // 验证地点归属
    const place = await this.prisma.place.findUnique({ where: { id: placeId } });
    if (!place) throw new NotFoundException('地点不存在');
    if (place.userId !== userId) throw new ForbiddenException('无权操作他人地点');

    // 获取当前最大 sort 值
    const lastItem = await this.prisma.collectionPlace.findFirst({
      where: { collectionId },
      orderBy: { sort: 'desc' },
    });
    const sort = (lastItem?.sort ?? -1) + 1;

    // upsert：已存在则跳过，不存在则创建
    await this.prisma.collectionPlace.upsert({
      where: { collectionId_placeId: { collectionId, placeId } },
      create: { collectionId, placeId, sort },
      update: {},
    });

    return this.findOne(collectionId, userId);
  }

  // 从合集中移除地点
  async removePlace(collectionId: string, placeId: string, userId: string) {
    const collection = await this.prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('合集不存在');
    if (collection.userId !== userId) throw new ForbiddenException('无权操作他人合集');

    await this.prisma.collectionPlace.deleteMany({
      where: { collectionId, placeId },
    });

    return { ok: true };
  }

  // 扁平化 places：CollectionPlace[] → Place[]，同时扁平化标签
  private toDto(collection: any) {
    return {
      ...collection,
      places:
        collection.places?.map((cp: any) => ({
          ...cp.place,
          tags: cp.place.tags?.map((pt: any) => pt.tag) || [],
        })) || [],
    };
  }
}
