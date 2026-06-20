import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ReviewActionDto } from './dto/review-action.dto';

@Injectable()
export class AdminReviewService {
  constructor(private prisma: PrismaService) {}

  // 查询审核队列：可按类型（place/checkin）和状态筛选
  async findAll(params: { type?: string; status?: string; page: number; pageSize: number }) {
    const { type, status, page, pageSize } = params;
    const reviewStatus = status || 'pending';

    if (type === 'place') {
      const [items, total] = await Promise.all([
        this.prisma.place.findMany({
          where: { reviewStatus },
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: { tags: { include: { tag: true } } },
        }),
        this.prisma.place.count({ where: { reviewStatus } }),
      ]);
      return { items: items.map((p) => ({ ...p, contentType: 'place' })), total, page, pageSize };
    }

    if (type === 'checkin') {
      const [items, total] = await Promise.all([
        this.prisma.checkIn.findMany({
          where: { reviewStatus },
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            place: { select: { customName: true, realName: true } },
            tags: { include: { tag: true } },
          },
        }),
        this.prisma.checkIn.count({ where: { reviewStatus } }),
      ]);
      return { items: items.map((c) => ({ ...c, contentType: 'checkin' })), total, page, pageSize };
    }

    // 不指定 type 时查询所有 pending 内容
    const [places, checkins, placeTotal, checkinTotal] = await Promise.all([
      this.prisma.place.findMany({
        where: { reviewStatus },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.checkIn.findMany({
        where: { reviewStatus },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { place: { select: { customName: true } } },
      }),
      this.prisma.place.count({ where: { reviewStatus } }),
      this.prisma.checkIn.count({ where: { reviewStatus } }),
    ]);
    const items = [
      ...places.map((p) => ({ ...p, contentType: 'place' })),
      ...checkins.map((c) => ({ ...c, contentType: 'checkin' })),
    ];
    return { items, total: placeTotal + checkinTotal, page, pageSize };
  }

  // 审核操作：通过或拒绝
  async review(id: string, dto: ReviewActionDto, contentType: string, adminId: string) {
    const reviewStatus = dto.action === 'passed' ? 'passed' : 'rejected';
    const data: any = { reviewStatus, reviewReason: dto.reason || null };

    if (contentType === 'place') {
      const item = await this.prisma.place.findUnique({ where: { id } });
      if (!item) throw new NotFoundException('地点不存在');
      return this.prisma.place.update({ where: { id }, data });
    }

    if (contentType === 'checkin') {
      const item = await this.prisma.checkIn.findUnique({ where: { id } });
      if (!item) throw new NotFoundException('打卡记录不存在');
      return this.prisma.checkIn.update({ where: { id }, data });
    }

    throw new NotFoundException('未知内容类型');
  }

  // 审核统计：各类型各状态的计数
  async getStats() {
    const [placePending, placeRejected, placePassed, checkinPending, checkinRejected, checkinPassed] =
      await Promise.all([
        this.prisma.place.count({ where: { reviewStatus: 'pending' } }),
        this.prisma.place.count({ where: { reviewStatus: 'rejected' } }),
        this.prisma.place.count({ where: { reviewStatus: 'passed' } }),
        this.prisma.checkIn.count({ where: { reviewStatus: 'pending' } }),
        this.prisma.checkIn.count({ where: { reviewStatus: 'rejected' } }),
        this.prisma.checkIn.count({ where: { reviewStatus: 'passed' } }),
      ]);
    return {
      place: { pending: placePending, rejected: placeRejected, passed: placePassed },
      checkin: { pending: checkinPending, rejected: checkinRejected, passed: checkinPassed },
      totalPending: placePending + checkinPending,
    };
  }
}
