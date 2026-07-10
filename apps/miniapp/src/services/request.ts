import Taro from '@tarojs/taro';

// 后端 API 基础地址
// - 开发环境：process.env.TARO_APP_API_BASE 未定义，fallback 到 localhost
// - 生产环境：config/prod.ts 中 defineConstants 注入真实域名
// - 部署时只需修改 config/prod.ts 中的 defineConstants，无需改动此文件
const BASE_URL = process.env.TARO_APP_API_BASE || 'http://localhost:3000/api';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  statusCode?: number;
}

// 统一网络请求封装：自动携带 JWT、处理错误
export async function request<T = unknown>(options: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: unknown;
  needAuth?: boolean;
}): Promise<T> {
  const { url, method = 'GET', data, needAuth = true } = options;
  const header: Record<string, string> = { 'Content-Type': 'application/json' };
  if (needAuth) {
    const token = Taro.getStorageSync('token');
    if (token) header.Authorization = `Bearer ${token}`;
  }
  const res = await Taro.request<ApiResponse<T>>({
    url: BASE_URL + url,
    method,
    data,
    header,
  });
  if (res.statusCode >= 400) {
    throw new Error((res.data as ApiResponse<T>)?.message || `HTTP ${res.statusCode}`);
  }
  return res.data as T;
}
