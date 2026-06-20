import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AdminAnnouncementService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(dto: CreateAnnouncementDto, adminId: string) {
    return this.prisma.announcement.create({
      data: {
        title: dto.title,
        content: dto.content,
        type: dto.type || 'popup',
        minVersion: dto.minVersion,
        linkUrl: dto.linkUrl,
        startAt: dto.startAt ? new Date(dto.startAt) : null,
        endAt: dto.endAt ? new Date(dto.endAt) : null,
        publishedBy: adminId,
      },
    });
  }

  async update(id: string, dto: UpdateAnnouncementDto) {
    const item = await this.prisma.announcement.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('公告不存在');
    const data: any = { ...dto };
    if (dto.startAt) data.startAt = new Date(dto.startAt);
    if (dto.endAt) data.endAt = new Date(dto.endAt);
    return this.prisma.announcement.update({ where: { id }, data });
  }

  async publish(id: string, adminId: string) {
    const item = await this.prisma.announcement.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('公告不存在');
    return this.prisma.announcement.update({
      where: { id },
      data: { isActive: true, publishedBy: adminId, publishedAt: new Date() },
    });
  }

  async unpublish(id: string) {
    const item = await this.prisma.announcement.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('公告不存在');
    return this.prisma.announcement.update({ where: { id }, data: { isActive: false } });
  }

  async remove(id: string) {
    const item = await this.prisma.announcement.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('公告不存在');
    await this.prisma.announcement.delete({ where: { id } });
    return { ok: true };
  }
}
