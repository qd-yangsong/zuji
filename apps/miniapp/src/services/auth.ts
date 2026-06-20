import Taro from '@tarojs/taro';
import { request } from './request';
import type { LoginResponseDto } from '@zuji/shared-types';

// 微信登录：wx.login 获取 code → 后端换 openid → 签发 JWT
export async function loginWithWx(): Promise<LoginResponseDto> {
  const { code } = await Taro.login();
  const result = await request<LoginResponseDto>({
    url: '/auth/login',
    method: 'POST',
    data: { code },
    needAuth: false,
  });
  Taro.setStorageSync('token', result.token);
  return result;
}
