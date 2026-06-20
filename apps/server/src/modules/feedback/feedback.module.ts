import { Module } from '@nestjs/common';
import { FeedbackController, AdminFeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

@Module({
  imports: [AdminAuthModule],
  controllers: [FeedbackController, AdminFeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
