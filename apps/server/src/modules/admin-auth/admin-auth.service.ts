import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 管理员账号密码登录（openid 作为用户名）
  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { openid: username },
    });
    if (!user) throw new UnauthorizedException('账号不存在');
    if (user.role !== 'admin') throw new UnauthorizedException('无管理员权限');
    if (user.status === 'banned') throw new UnauthorizedException('账号已被封禁');
    if (!user.password) throw new UnauthorizedException('账号未设置密码');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('密码错误');

    const token = this.jwtService.sign({
      sub: user.id,
      role: user.role,
      nickname: user.nickname,
    });

    return {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        role: user.role,
      },
    };
  }

  // 获取当前管理员信息
  getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  // 修改密码
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('用户不存在');
    if (!user.password) throw new UnauthorizedException('账号未设置密码');

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) throw new UnauthorizedException('原密码错误');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { ok: true };
  }
}
