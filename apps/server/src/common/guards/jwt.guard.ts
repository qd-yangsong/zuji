import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// JWT 守卫：保护需要登录的接口
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
