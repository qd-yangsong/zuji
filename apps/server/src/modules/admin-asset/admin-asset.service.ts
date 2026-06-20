import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminAssetService {
  constructor(private prisma: PrismaService) {}

  // 分页查询素材列表，支持按分类筛选
  findAll(params: { category?: string; page?: number; pageSize?: number }) {
    const { category, page = 1, pageSize = 20 } = params;
    return this.prisma.asset.findMany({
      where: {
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  // 创建素材记录
  async create(data: {
    category: string;
    key: string;
    name: string;
    url: string;
    mimeType: string;
    fileSize: number;
    uploadedBy: string;
  }) {
    return this.prisma.asset.create({ data });
  }

  // 更新素材（名称、状态）
  async update(id: string, data: { name?: string; status?: string }) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('素材不存在');
    return this.prisma.asset.update({ where: { id }, data });
  }

  // 删除素材
  async remove(id: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('素材不存在');
    await this.prisma.asset.delete({ where: { id } });
    return { ok: true };
  }
}
