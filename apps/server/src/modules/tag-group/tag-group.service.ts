import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTagGroupDto } from './dto/create-tag-group.dto';

@Injectable()
export class TagGroupService {
  constructor(private prisma: PrismaService) {}

  // 查询所有标签组：系统预设 + 当前用户自定义
  async findAll(userId: string, tagType?: string) {
    return this.prisma.tagGroup.findMany({
      where: {
        OR: [{ userId: null }, { userId }],
        ...(tagType ? { tagType } : {}),
      },
      orderBy: [{ isSystem: 'desc' }, { createdAt: 'asc' }],
      include: { tags: true },
    });
  }

  // 创建用户自定义标签组
  async create(dto: CreateTagGroupDto, userId: string) {
    return this.prisma.tagGroup.create({
      data: { name: dto.name, color: dto.color, icon: dto.icon, tagType: dto.tagType, userId, isSystem: false },
    });
  }

  // 删除标签组（仅可删自己的自定义组）
  async remove(groupId: string, userId: string) {
    const group = await this.prisma.tagGroup.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('标签组不存在');
    if (group.isSystem) throw new ForbiddenException('系统预设标签组不可删除');
    if (group.userId !== userId) throw new ForbiddenException('无权删除他人标签组');
    await this.prisma.tagGroup.delete({ where: { id: groupId } });
    return { ok: true };
  }
}
