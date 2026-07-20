import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { QueryPlaceDto } from './dto/query-place.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('places')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get()
  findAll(
    @Query() query: QueryPlaceDto,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.placeService.findAll(user.id, query);
  }

  // 模糊搜索（名称 + 标签）
  @Get('search')
  search(
    @Query('q') keyword: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.placeService.search(user.id, keyword);
  }

  // 附近地点匹配（用于「记录」Tab）
  @Get('nearby')
  findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.placeService.findNearby(
      user.id,
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseInt(radius) : 100,
    );
  }

  // 旅程时间线（用于发现页）
  @Get('timeline')
  getTimeline(
    @Query('year') year: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.placeService.getTimeline(user.id, year ? parseInt(year) : undefined);
  }

  // 年度足迹总结
  @Get('summary')
  getYearSummary(
    @Query('year') year: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    const yearNum = year ? parseInt(year) : new Date().getFullYear();
    return this.placeService.getYearSummary(user.id, yearNum);
  }

  @Get('journey/map')
  getJourneyMap(@CurrentUser() user: { id: string; openid: string }) {
    return this.placeService.getJourneyMarkers(user.id);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.placeService.findOne(id, user.id);
  }

  @Post()
  create(
    @Body() dto: CreatePlaceDto,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.placeService.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreatePlaceDto>,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.placeService.update(id, dto, user.id);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.placeService.remove(id, user.id);
  }
}
