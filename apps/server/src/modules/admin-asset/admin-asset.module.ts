import { Module } from '@nestjs/common';
import { AdminAssetController } from './admin-asset.controller';
import { AdminAssetService } from './admin-asset.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { AdminGuard } from '../../common/guards/admin.guard';

@Module({
  // 导入 AdminAuthModule 以获取配置了 admin 密钥的 JwtModule（AdminGuard 依赖）
  imports: [AdminAuthModule],
  controllers: [AdminAssetController],
  providers: [AdminAssetService, AdminGuard],
})
export class AdminAssetModule {}
