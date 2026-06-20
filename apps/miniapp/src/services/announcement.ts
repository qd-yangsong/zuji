import { request } from './request';

// 获取当前生效的公告（公开接口）
export async function fetchActiveAnnouncements() {
  return request({ url: '/config/announcements', method: 'GET', needAuth: false });
}
