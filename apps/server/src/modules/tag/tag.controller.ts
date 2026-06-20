import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  // 按类型查询标签
  @Get()
  findByType(
    @Query('type') type: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.tagService.findByType(type || 'attribute', user.id);
  }

  // 创建自定义标签
  @Post()
  create(
    @Body() dto: CreateTagDto,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.tagService.create(dto, user.id);
  }

  // 删除自定义标签
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.tagService.remove(id, user.id);
  }
}
