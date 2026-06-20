import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TagService } from '../tag/tag.service';
import { CreateCheckInDto } from './dto/create-checkin.dto';

@Injectable()
export class CheckInService {
  constructor(
    private prisma: PrismaService,
    private tagService: TagService,
  ) {}

  // 创建打卡记录
  async create(dto: CreateCheckInDto, userId: string) {
    // 验证地点归属
    const place = await this.prisma.place.findUnique({ where: { id: dto.placeId } });
    if (!place) throw new NotFoundException('地点不存在');
    if (place.userId !== userId) throw new ForbiddenException('无权操作他人地点');

    // 判断是否首次（place.checkinCount === 0）
    const isFirst = place.checkinCount === 0;

    // 创建打卡记录 + 关联事件标签（事务保证一致性）
    const [checkin] = await this.prisma.$transaction([
      this.prisma.checkIn.create({
        data: {
          placeId: dto.placeId,
          userId,
          content: dto.content,
          images: dto.images || [],
          isFirst,
          tags: {
            create: dto.eventTagIds.map((tagId) => ({ tagId })),
          },
        },
        include: { tags: { include: { tag: true } } },
      }),
      // 递增地点打卡次数
      this.prisma.place.update({
        where: { id: dto.placeId },
        data: { checkinCount: { increment: 1 } },
      }),
    ]);

    // 递增标签使用次数
    if (dto.eventTagIds.length > 0) {
      await this.tagService.incrementUsage(dto.eventTagIds);
    }

    return this.toDto(checkin);
  }

  // 获取某地点的打卡时间轴（按时间倒序）
  async findByPlace(placeId: string, userId: string) {
    // 验证地点归属
    const place = await this.prisma.place.findUnique({ where: { id: placeId } });
    if (!place) throw new NotFoundException('地点不存在');
    if (place.userId !== userId) throw new ForbiddenException('无权访问他人地点');

    const checkins = await this.prisma.checkIn.findMany({
      where: { placeId },
      orderBy: { checkinAt: 'desc' },
      include: { tags: { include: { tag: true } } },
    });

    return checkins.map((c) => this.toDto(c));
  }

  // 删除打卡记录
  async remove(checkinId: string, userId: string) {
    const checkin = await this.prisma.checkIn.findUnique({ where: { id: checkinId } });
    if (!checkin) throw new NotFoundException('打卡记录不存在');
    if (checkin.userId !== userId) throw new ForbiddenException('无权删除他人记录');

    await this.prisma.$transaction([
      this.prisma.checkIn.delete({ where: { id: checkinId } }),
      // 递减地点打卡次数
      this.prisma.place.update({
        where: { id: checkin.placeId },
        data: { checkinCount: { decrement: 1 } },
      }),
    ]);

    return { ok: true };
  }

  // 转换为 DTO（扁平化标签）
  private toDto(checkin: any) {
    return {
      ...checkin,
      tags: checkin.tags?.map((ct: any) => ct.tag) || [],
    };
  }
}
