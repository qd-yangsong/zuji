import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  // 用户提交反馈（需要小程序登录）
  async create(dto: CreateFeedbackDto, userId: string, openid: string) {
    return this.prisma.feedback.create({
      data: { ...dto, userId, openid, images: dto.images || [] },
    });
  }

  // 用户查看自己的反馈
  async findMine(userId: string) {
    return this.prisma.feedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ===== 以下为管理员接口 =====

  async findAll(params: { status?: string; type?: string; page: number; pageSize: number }) {
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.type) where.type = params.type;
    const [items, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.feedback.count({ where }),
    ]);
    return { items, total, page: params.page, pageSize: params.pageSize };
  }

  async findOne(id: string) {
    const item = await this.prisma.feedback.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('反馈不存在');
    return item;
  }

  async updateStatus(id: string, status: string) {
    const item = await this.prisma.feedback.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('反馈不存在');
    return this.prisma.feedback.update({ where: { id }, data: { status } });
  }

  async reply(id: string, reply: string, adminId: string) {
    const item = await this.prisma.feedback.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('反馈不存在');
    return this.prisma.feedback.update({
      where: { id },
      data: { reply, repliedBy: adminId, repliedAt: new Date(), status: 'resolved' },
    });
  }

  async getStats() {
    const [pending, processing, resolved, closed] = await Promise.all([
      this.prisma.feedback.count({ where: { status: 'pending' } }),
      this.prisma.feedback.count({ where: { status: 'processing' } }),
      this.prisma.feedback.count({ where: { status: 'resolved' } }),
      this.prisma.feedback.count({ where: { status: 'closed' } }),
    ]);
    const byType = await this.prisma.feedback.groupBy({
      by: ['type'],
      _count: true,
    });
    return { pending, processing, resolved, closed, byType };
  }
}
