// 前后端共享的类型定义

// 通用接口响应封装
export interface ApiError {
  statusCode: number;
  message: string;
}

// 用户基本信息
export interface UserDto {
  id: string;
  openid: string;
  nickname?: string;
  avatarUrl?: string;
}

// 登录返回
export interface LoginResponseDto {
  token: string;
  user: UserDto;
}
