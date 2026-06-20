import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminThemeService {
  constructor(private prisma: PrismaService) {}

  // 查询所有版本
  findAll() {
    return this.prisma.themeConfig.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // 查看当前生效配置
  findActive() {
    return this.prisma.themeConfig.findFirst({
      where: { isActive: true },
    });
  }

  // 创建新版本
  async create(data: {
    version: string;
    config: any;
    updatedBy: string;
  }) {
    const existing = await this.prisma.themeConfig.findUnique({
      where: { version: data.version },
    });
    if (existing) throw new BadRequestException('版本号已存在');
    return this.prisma.themeConfig.create({
      data: {
        version: data.version,
        config: data.config,
        updatedBy: data.updatedBy,
      },
    });
  }

  // 发布主题配置：将目标版本设为 active，其余版本设为 inactive
  async publish(id: string, adminId: string) {
    const theme = await this.prisma.themeConfig.findUnique({
      where: { id },
    });
    if (!theme) throw new NotFoundException('主题配置不存在');

    // 事务保证原子性：先取消所有生效版本，再激活目标版本
    await this.prisma.$transaction([
      this.prisma.themeConfig.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      }),
      this.prisma.themeConfig.update({
        where: { id },
        data: { isActive: true, updatedBy: adminId },
      }),
    ]);

    return { ok: true, version: theme.version };
  }

  // 删除未发布的版本
  async remove(id: string) {
    const theme = await this.prisma.themeConfig.findUnique({
      where: { id },
    });
    if (!theme) throw new NotFoundException('主题配置不存在');
    if (theme.isActive)
      throw new BadRequestException('不能删除正在生效的版本');
    await this.prisma.themeConfig.delete({ where: { id } });
    return { ok: true };
  }
}
