import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsString, IsInt, Min, IsOptional } from 'class-validator';
import { AdminAssetService } from './admin-asset.service';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminUser } from '../../common/decorators/admin-user.decorator';

class CreateAssetDto {
  @IsString() category!: string;
  @IsString() key!: string;
  @IsString() name!: string;
  @IsString() url!: string;
  @IsString() mimeType!: string;
  @IsInt() @Min(0) fileSize!: number;
}

class UpdateAssetDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() status?: string;
}

@UseGuards(AdminGuard)
@Controller('admin/assets')
export class AdminAssetController {
  constructor(private readonly assetService: AdminAssetService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.assetService.findAll({
      category,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
  }

  @Post()
  create(@Body() dto: CreateAssetDto, @AdminUser() user: { id: string }) {
    return this.assetService.create({ ...dto, uploadedBy: user.id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAssetDto) {
    return this.assetService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetService.remove(id);
  }
}
