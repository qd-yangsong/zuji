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
