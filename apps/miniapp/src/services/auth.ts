import Taro from '@tarojs/taro';
import { request } from './request';
import { setUser } from '../stores/userStore';
import type { LoginResponseDto } from '@zuji/shared-types';

/**
 * 微信登录流程：
 * 1. wx.login() 获取临时登录凭证 code（静默，无弹窗）
 * 2. 将 code 发送到后端，后端用 code + AppID + AppSecret 调用微信 jscode2session 换取 openid
 * 3. 后端根据 openid 创建/更新用户，签发 JWT 返回
 * 4. 前端保存 token 和用户信息
 */
export async function loginWithWx(): Promise<LoginResponseDto> {
  const { code } = await Taro.login();
  const result = await request<LoginResponseDto>({
    url: '/auth/login',
    method: 'POST',
    data: { code },
    needAuth: false,
  });

  // 持久化 token 和用户信息
  Taro.setStorageSync('token', result.token);
  if (result.user) {
    setUser(result.user);
  }

  return result;
}
