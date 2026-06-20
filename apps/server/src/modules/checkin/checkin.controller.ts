import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CheckInService } from './checkin.service';
import { CreateCheckInDto } from './dto/create-checkin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('checkins')
export class CheckInController {
  constructor(private readonly checkinService: CheckInService) {}

  // 创建打卡
  @Post()
  create(
    @Body() dto: CreateCheckInDto,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.checkinService.create(dto, user.id);
  }

  // 获取某地点的打卡时间轴
  @Get('place/:placeId')
  findByPlace(
    @Param('placeId') placeId: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.checkinService.findByPlace(placeId, user.id);
  }

  // 删除打卡记录
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.checkinService.remove(id, user.id);
  }
}
