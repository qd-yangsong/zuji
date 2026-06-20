import { Module } from '@nestjs/common';
import { AdminThemeController } from './admin-theme.controller';
import { AdminThemeService } from './admin-theme.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { AdminGuard } from '../../common/guards/admin.guard';

@Module({
  // 导入 AdminAuthModule 以获取配置了 admin 密钥的 JwtModule（AdminGuard 依赖）
  imports: [AdminAuthModule],
  controllers: [AdminThemeController],
  providers: [AdminThemeService, AdminGuard],
})
export class AdminThemeModule {}
