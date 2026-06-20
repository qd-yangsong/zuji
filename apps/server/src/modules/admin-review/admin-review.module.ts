import { Module } from '@nestjs/common';
import { AdminReviewController } from './admin-review.controller';
import { AdminReviewService } from './admin-review.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

@Module({
  imports: [AdminAuthModule],
  controllers: [AdminReviewController],
  providers: [AdminReviewService],
})
export class AdminReviewModule {}
