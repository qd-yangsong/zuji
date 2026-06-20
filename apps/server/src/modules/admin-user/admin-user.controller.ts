import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { BanUserDto } from './dto/ban-user.dto';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminUser } from '../../common/decorators/admin-user.decorator';

@UseGuards(AdminGuard)
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly service: AdminUserService) {}

  @Get()
  findAll(
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.findAll({
      keyword,
      status,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 20,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/ban')
  ban(@Param('id') id: string, @Body() dto: BanUserDto, @AdminUser() admin: { id: string }) {
    return this.service.ban(id, dto.reason || '违反社区规定', admin.id);
  }

  @Patch(':id/unban')
  unban(@Param('id') id: string) {
    return this.service.unban(id);
  }
}
