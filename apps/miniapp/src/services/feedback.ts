import { request } from './request';

// 提交反馈
export async function submitFeedback(data: {
  type: string;
  content: string;
  images?: string[];
  contact?: string;
  appVersion?: string;
  platform?: string;
}) {
  return request({ url: '/feedback', method: 'POST', data });
}

// 查看我的反馈
export async function fetchMyFeedbacks() {
  return request({ url: '/feedback/mine', method: 'GET' });
}
