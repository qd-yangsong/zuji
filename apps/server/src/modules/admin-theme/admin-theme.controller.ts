import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsString, IsArray, IsObject } from 'class-validator';
import { AdminThemeService } from './admin-theme.service';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminUser } from '../../common/decorators/admin-user.decorator';

class CreateThemeDto {
  @IsString()
  version!: string;

  @IsArray()
  @IsObject({ each: true })
  config!: any[];
}

@UseGuards(AdminGuard)
@Controller('admin/themes')
export class AdminThemeController {
  constructor(private readonly themeService: AdminThemeService) {}

  @Get()
  findAll() {
    return this.themeService.findAll();
  }

  @Get('active')
  findActive() {
    return this.themeService.findActive();
  }

  @Post()
  create(@Body() dto: CreateThemeDto, @AdminUser() user: { id: string }) {
    return this.themeService.create({ ...dto, updatedBy: user.id });
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @AdminUser() user: { id: string }) {
    return this.themeService.publish(id, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.themeService.remove(id);
  }
}
