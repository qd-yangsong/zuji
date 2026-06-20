import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { AdminAuthService } from './admin-auth.service';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminUser } from '../../common/decorators/admin-user.decorator';

class LoginDto {
  @IsString()
  @MinLength(1)
  username!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  oldPassword!: string;

  @IsString()
  @MinLength(6)
  newPassword!: string;
}

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  // 登录（不需要 AdminGuard）
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.adminAuthService.login(dto.username, dto.password);
  }

  // 获取当前管理员信息
  @UseGuards(AdminGuard)
  @Get('profile')
  getProfile(@AdminUser() user: { id: string }) {
    return this.adminAuthService.getProfile(user.id);
  }

  // 修改密码
  @UseGuards(AdminGuard)
  @Post('change-password')
  changePassword(
    @AdminUser() user: { id: string },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.adminAuthService.changePassword(
      user.id,
      dto.oldPassword,
      dto.newPassword,
    );
  }
}
