import { Module } from '@nestjs/common';
import { AdminAnnouncementController } from './admin-announcement.controller';
import { AdminAnnouncementService } from './admin-announcement.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

@Module({
  imports: [AdminAuthModule],
  controllers: [AdminAnnouncementController],
  providers: [AdminAnnouncementService],
})
export class AdminAnnouncementModule {}
