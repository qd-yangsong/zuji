import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminReviewService } from './admin-review.service';
import { ReviewActionDto } from './dto/review-action.dto';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminUser } from '../../common/decorators/admin-user.decorator';

@UseGuards(AdminGuard)
@Controller('admin/reviews')
export class AdminReviewController {
  constructor(private readonly reviewService: AdminReviewService) {}

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.reviewService.findAll({
      type,
      status,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 20,
    });
  }

  @Get('stats')
  getStats() {
    return this.reviewService.getStats();
  }

  @Patch(':contentType/:id')
  review(
    @Param('contentType') contentType: string,
    @Param('id') id: string,
    @Body() dto: ReviewActionDto,
    @AdminUser() admin: { id: string },
  ) {
    return this.reviewService.review(id, dto, contentType, admin.id);
  }
}
