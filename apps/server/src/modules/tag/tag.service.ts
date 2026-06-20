import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  // 按类型查询：系统预设 + 当前用户自定义
  async findByType(type: string, userId: string) {
    return this.prisma.tag.findMany({
      where: { type, OR: [{ userId: null }, { userId }] },
      orderBy: [{ isSystem: 'desc' }, { usageCount: 'desc' }, { createdAt: 'asc' }],
      include: { group: true },
    });
  }

  // 创建用户自定义标签
  async create(dto: CreateTagDto, userId: string) {
    return this.prisma.tag.create({
      data: { name: dto.name, type: dto.type, groupId: dto.groupId, userId, isSystem: false },
    });
  }

  // 删除标签（仅可删自己的自定义标签，系统预设不可删）
  async remove(tagId: string, userId: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id: tagId } });
    if (!tag) throw new NotFoundException('标签不存在');
    if (tag.isSystem) throw new ForbiddenException('系统预设标签不可删除');
    if (tag.userId !== userId) throw new ForbiddenException('无权删除他人标签');
    await this.prisma.tag.delete({ where: { id: tagId } });
    return { ok: true };
  }

  // 增加使用次数（供 Place / CheckIn 模块调用）
  async incrementUsage(tagIds: string[]) {
    if (tagIds.length === 0) return;
    await this.prisma.tag.updateMany({
      where: { id: { in: tagIds } },
      data: { usageCount: { increment: 1 } },
    });
  }
}
