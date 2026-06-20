import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminAnnouncementService } from './admin-announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminUser } from '../../common/decorators/admin-user.decorator';

@UseGuards(AdminGuard)
@Controller('admin/announcements')
export class AdminAnnouncementController {
  constructor(private readonly service: AdminAnnouncementService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateAnnouncementDto, @AdminUser() admin: { id: string }) {
    return this.service.create(dto, admin.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @AdminUser() admin: { id: string }) {
    return this.service.publish(id, admin.id);
  }

  @Post(':id/unpublish')
  unpublish(@Param('id') id: string) {
    return this.service.unpublish(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
