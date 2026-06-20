import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string; openid: string }) {
    return this.collectionService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string; openid: string }) {
    return this.collectionService.findOne(id, user.id);
  }

  @Post()
  create(@Body() dto: CreateCollectionDto, @CurrentUser() user: { id: string; openid: string }) {
    return this.collectionService.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.collectionService.update(id, dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string; openid: string }) {
    return this.collectionService.remove(id, user.id);
  }
}
