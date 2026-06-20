import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminUserService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { keyword?: string; status?: string; page: number; pageSize: number }) {
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.keyword) {
      where.OR = [
        { nickname: { contains: params.keyword, mode: 'insensitive' } },
        { openid: { contains: params.keyword } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          openid: true,
          nickname: true,
          avatarUrl: true,
          role: true,
          status: true,
          createdAt: true,
          bannedAt: true,
          bannedReason: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    // 附加每个用户的地点数和打卡数
    const itemsWithStats = await Promise.all(
      items.map(async (u) => {
        const [placeCount, checkinCount] = await Promise.all([
          this.prisma.place.count({ where: { userId: u.id } }),
          this.prisma.checkIn.count({ where: { place: { userId: u.id } } }),
        ]);
        return { ...u, placeCount, checkinCount };
      }),
    );
    return { items: itemsWithStats, total, page: params.page, pageSize: params.pageSize };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        openid: true,
        nickname: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        bannedAt: true,
        bannedReason: true,
      },
    });
    if (!user) throw new NotFoundException('用户不存在');
    const [placeCount, checkinCount] = await Promise.all([
      this.prisma.place.count({ where: { userId: id } }),
      this.prisma.checkIn.count({ where: { place: { userId: id } } }),
    ]);
    return { ...user, placeCount, checkinCount };
  }

  async ban(id: string, reason: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    if (user.role === 'admin') throw new ForbiddenException('不能封禁管理员');
    return this.prisma.user.update({
      where: { id },
      data: { status: 'banned', bannedAt: new Date(), bannedReason: reason },
    });
  }

  async unban(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    return this.prisma.user.update({
      where: { id },
      data: { status: 'active', bannedAt: null, bannedReason: null },
    });
  }
}
