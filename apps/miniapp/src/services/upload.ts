import Taro from '@tarojs/taro';
import { request } from './request';

interface CosPolicy {
  cosSecretId: string;
  policy: string;
  signature: string;
  keyTime: string;
  host: string;
  dir: string;
  expire: number;
}

/**
 * 获取文件大小（字节）
 */
function getFileSize(filePath: string): Promise<number> {
  return new Promise((resolve) => {
    Taro.getFileSystemManager().getFileInfo({
      filePath,
      success: (res) => resolve(res.size),
      fail: () => resolve(0),
    });
  });
}

/**
 * 压缩图片，确保不超过微信 2MB 上传限制
 */
async function compressIfNeeded(localPath: string): Promise<string> {
  const MAX_SIZE = 1.8 * 1024 * 1024;
  const originalSize = await getFileSize(localPath);

  if (originalSize > 0 && originalSize <= MAX_SIZE) {
    return localPath;
  }

  let width = 1280;
  try {
    const info = await Taro.getImageInfo({ src: localPath });
    width = Math.min(info.width, 1280);
  } catch { /* getImageInfo 失败，使用默认宽度 */ }

  const qualities = [60, 40, 20];
  let filePath = localPath;

  for (const quality of qualities) {
    try {
      const compressed = await Taro.compressImage({
        src: filePath,
        quality,
        compressedWidth: width,
      });
      filePath = compressed.tempFilePath;

      const compressedSize = await getFileSize(filePath);
      if (compressedSize > 0 && compressedSize <= MAX_SIZE) {
        return filePath;
      }
    } catch {
      try {
        const compressed = await Taro.compressImage({
          src: localPath,
          quality,
        });
        filePath = compressed.tempFilePath;
        const compressedSize = await getFileSize(filePath);
        if (compressedSize > 0 && compressedSize <= MAX_SIZE) {
          return filePath;
        }
      } catch { /* 降级压缩也失败 */ }
    }
  }

  return filePath;
}

// 上传单张图片到腾讯云 COS，返回最终公开 URL
export async function uploadImage(localPath: string): Promise<string> {
  const filePath = await compressIfNeeded(localPath);

  const policy = await request<CosPolicy>({ url: '/cos/policy' });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const key = policy.dir + filename;

  return new Promise((resolve, reject) => {
    Taro.uploadFile({
      url: policy.host,
      filePath,
      name: 'file',
      formData: {
        key,
        policy: policy.policy,
        'q-sign-algorithm': 'sha1',
        'q-ak': policy.cosSecretId,
        'q-key-time': policy.keyTime,
        'q-signature': policy.signature,
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(`${policy.host}/${key}`);
        } else {
          reject(new Error(`上传失败: HTTP ${res.statusCode}, ${res.data}`));
        }
      },
      fail: (err) => reject(new Error(`上传失败: ${err.errMsg}`)),
    });
  });
}
