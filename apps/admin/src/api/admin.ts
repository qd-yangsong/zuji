import { request } from '../utils/request';

// 内容审核
export const reviewApi = {
  list: (params: any) => request({ url: '/admin/reviews', method: 'GET', params }),
  stats: () => request({ url: '/admin/reviews/stats', method: 'GET' }),
  review: (contentType: string, id: string, data: { action: string; reason?: string }) =>
    request({ url: `/admin/reviews/${contentType}/${id}`, method: 'PATCH', data }),
};

// 公告
export const announcementApi = {
  list: () => request({ url: '/admin/announcements', method: 'GET' }),
  create: (data: any) => request({ url: '/admin/announcements', method: 'POST', data }),
  update: (id: string, data: any) => request({ url: `/admin/announcements/${id}`, method: 'PATCH', data }),
  publish: (id: string) => request({ url: `/admin/announcements/${id}/publish`, method: 'POST' }),
  unpublish: (id: string) => request({ url: `/admin/announcements/${id}/unpublish`, method: 'POST' }),
  remove: (id: string) => request({ url: `/admin/announcements/${id}`, method: 'DELETE' }),
};

// 反馈
export const feedbackApi = {
  list: (params: any) => request({ url: '/admin/feedbacks', method: 'GET', params }),
  stats: () => request({ url: '/admin/feedbacks/stats', method: 'GET' }),
  detail: (id: string) => request({ url: `/admin/feedbacks/${id}`, method: 'GET' }),
  updateStatus: (id: string, status: string) => request({ url: `/admin/feedbacks/${id}/status`, method: 'PATCH', data: { status } }),
  reply: (id: string, reply: string) => request({ url: `/admin/feedbacks/${id}/reply`, method: 'POST', data: { reply } }),
};

// 用户管理
export const userApi = {
  list: (params: any) => request({ url: '/admin/users', method: 'GET', params }),
  detail: (id: string) => request({ url: `/admin/users/${id}`, method: 'GET' }),
  ban: (id: string, reason?: string) => request({ url: `/admin/users/${id}/ban`, method: 'PATCH', data: { reason } }),
  unban: (id: string) => request({ url: `/admin/users/${id}/unban`, method: 'PATCH' }),
};

// 统计+日志
export const statsApi = {
  overview: () => request({ url: '/admin/stats/overview', method: 'GET' }),
  trends: () => request({ url: '/admin/stats/trends', method: 'GET' }),
  tags: () => request({ url: '/admin/stats/tags', method: 'GET' }),
  logs: (params: any) => request({ url: '/admin/logs', method: 'GET', params }),
};
