import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// 从 req.user 提取当前登录用户信息
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as { id: string; openid: string };
  },
);
