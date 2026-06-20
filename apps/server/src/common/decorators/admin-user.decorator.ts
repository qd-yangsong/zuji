import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// 从 req.user 提取 AdminGuard 挂载的管理员信息 { id, role, nickname }
export const AdminUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as { id: string; role: string; nickname?: string };
  },
);
