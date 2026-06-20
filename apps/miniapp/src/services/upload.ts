import Taro from '@tarojs/taro';
import { request } from './request';

interface CosPolicy {
  cosSecretId: string;
  policy: string;
  signature: string;
  host: string;
  dir: string;
  expire: number;
}

// 上传单张图片到腾讯云 COS，返回最终公开 URL
export async function uploadImage(localPath: string): Promise<string> {
  const policy = await request<CosPolicy>({ url: '/cos/policy' });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const key = policy.dir + filename;

  return new Promise((resolve, reject) => {
    Taro.uploadFile({
      url: policy.host,
      filePath: localPath,
      name: 'file',
      formData: {
        key,
        'Content-Type': 'image/jpeg',
        COSSecretId: policy.cosSecretId,
        policy: policy.policy,
        signature: policy.signature,
      },
      success: () => resolve(`${policy.host}/${key}`),
      fail: (err) => reject(err),
    });
  });
}
