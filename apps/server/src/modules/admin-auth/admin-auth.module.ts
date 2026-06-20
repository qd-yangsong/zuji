import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminGuard } from '../../common/guards/admin.guard';

// 管理员鉴权模块：使用 admin 专用 JWT 密钥，与普通用户 JWT 隔离
// 导出 JwtModule 供其他 admin 模块复用（AdminGuard 依赖此 JwtService）
@Module({
  imports: [
    JwtModule.register({
      secret:
        process.env.JWT_ADMIN_SECRET ||
        'admin-secret-dev-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminGuard],
  exports: [AdminAuthService, JwtModule, AdminGuard],
})
export class AdminAuthModule {}
