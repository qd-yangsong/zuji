import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { AddPlaceDto } from './dto/add-place.dto';
import { ReorderPlacesDto } from './dto/reorder.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  findAll(
    @Query('type') type: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.routeService.findAll(user.id, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string; openid: string }) {
    return this.routeService.findOne(id, user.id);
  }

  @Post()
  create(@Body() dto: CreateRouteDto, @CurrentUser() user: { id: string; openid: string }) {
    return this.routeService.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRouteDto,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.routeService.update(id, dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string; openid: string }) {
    return this.routeService.remove(id, user.id);
  }

  @Post(':id/places')
  addPlace(
    @Param('id') id: string,
    @Body() dto: AddPlaceDto,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.routeService.addPlace(id, dto, user.id);
  }

  @Delete(':id/places/:placeId')
  removePlace(
    @Param('id') id: string,
    @Param('placeId') placeId: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.routeService.removePlace(id, placeId, user.id);
  }

  @Patch(':id/reorder')
  reorderPlaces(
    @Param('id') id: string,
    @Body() dto: ReorderPlacesDto,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.routeService.reorderPlaces(id, dto, user.id);
  }

  @Post(':id/complete')
  completeJourney(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.routeService.completeJourney(id, user.id);
  }
}
