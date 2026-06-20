import { Module } from '@nestjs/common';
import { AdminUserController } from './admin-user.controller';
import { AdminUserService } from './admin-user.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

@Module({
  imports: [AdminAuthModule],
  controllers: [AdminUserController],
  providers: [AdminUserService],
})
export class AdminUserModule {}
