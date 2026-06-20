import { Injectable } from '@nestjs/common';
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
}
