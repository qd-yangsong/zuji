import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // 根据 openid upsert 用户：存在则更新，不存在则创建
  async upsertByOpenid(openid: string, unionid?: string) {
    return this.prisma.user.upsert({
      where: { openid },
      update: { unionid: unionid ?? undefined },
      create: { openid, unionid },
    });
  }

  // 获取用户已解锁的贴纸 ID 列表
  async getStickerUnlocks(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stickerUnlocks: true },
    });
    if (!user) throw new NotFoundException('用户不存在');
    return { stickerUnlocks: user.stickerUnlocks };
  }

  // 解锁贴纸（幂等，已解锁则无操作）
  async unlockSticker(userId: string, stickerId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    if (user.stickerUnlocks.includes(stickerId)) {
      return { stickerUnlocks: user.stickerUnlocks, alreadyUnlocked: true };
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        stickerUnlocks: { push: stickerId },
      },
      select: { stickerUnlocks: true },
    });
    return { stickerUnlocks: updated.stickerUnlocks, alreadyUnlocked: false };
  }

  // 批量解锁贴纸
  async unlockStickers(userId: string, stickerIds: string[]) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    // 过滤出未解锁的
    const newIds = stickerIds.filter((id) => !user.stickerUnlocks.includes(id));
    if (newIds.length === 0) {
      return { stickerUnlocks: user.stickerUnlocks };
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        stickerUnlocks: { push: newIds },
      },
      select: { stickerUnlocks: true },
    });
    return { stickerUnlocks: updated.stickerUnlocks };
  }

  // 更新用户签名（「我的」页面封面）
  async updateSignature(userId: string, signature: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { signature: signature.slice(0, 50) },
      select: { id: true, nickname: true, avatarUrl: true, signature: true },
    });
    return updated;
  }
}
