import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// 管理员专用守卫：使用 admin 专用 JWT 密钥校验，仅放行 role=admin 的 token
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ForbiddenException('缺少管理员凭证');
    }
    const token = authHeader.substring(7);
    try {
      // 使用 admin 专用密钥验证，与普通用户 JWT 隔离
      const payload = this.jwtService.verify(token, {
        secret:
          process.env.JWT_ADMIN_SECRET ||
          'admin-secret-dev-change-in-production',
      });
      if (payload.role !== 'admin') {
        throw new ForbiddenException('非管理员账号');
      }
      // 将管理员信息挂载到 request.user，供 AdminUser 装饰器读取
      request.user = {
        id: payload.sub,
        role: payload.role,
        nickname: payload.nickname,
      };
      return true;
    } catch {
      throw new ForbiddenException('管理员凭证无效');
    }
  }
}
