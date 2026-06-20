import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { TagGroupService } from './tag-group.service';
import { CreateTagGroupDto } from './dto/create-tag-group.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tag-groups')
export class TagGroupController {
  constructor(private readonly tagGroupService: TagGroupService) {}

  @Get()
  findAll(
    @Query('tagType') tagType: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.tagGroupService.findAll(user.id, tagType);
  }

  @Post()
  create(
    @Body() dto: CreateTagGroupDto,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.tagGroupService.create(dto, user.id);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.tagGroupService.remove(id, user.id);
  }
}
