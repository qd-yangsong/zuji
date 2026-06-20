import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminUser } from '../../common/decorators/admin-user.decorator';

// 用户反馈接口（需要小程序登录）
@UseGuards(JwtAuthGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly service: FeedbackService) {}

  @Post()
  create(@Body() dto: CreateFeedbackDto, @CurrentUser() user: { id: string; openid: string }) {
    return this.service.create(dto, user.id, user.openid);
  }

  @Get('mine')
  findMine(@CurrentUser() user: { id: string; openid: string }) {
    return this.service.findMine(user.id);
  }
}

// 管理员反馈管理接口
@UseGuards(AdminGuard)
@Controller('admin/feedbacks')
export class AdminFeedbackController {
  constructor(private readonly service: FeedbackService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.findAll({
      status,
      type,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 20,
    });
  }

  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.service.updateStatus(id, status);
  }

  @Post(':id/reply')
  reply(
    @Param('id') id: string,
    @Body('reply') reply: string,
    @AdminUser() admin: { id: string },
  ) {
    return this.service.reply(id, reply, admin.id);
  }
}
