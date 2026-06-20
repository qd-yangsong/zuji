import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// 请求拦截器：自动加 token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：统一错误处理
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 统一请求函数：供 api 层以 { url, method, data, params } 形式调用
// 响应拦截器已解包 data，故返回 Promise<any>
export function request(options: {
  url: string;
  method: string;
  data?: any;
  params?: any;
}): Promise<any> {
  return instance(options as any);
}

export default instance;
