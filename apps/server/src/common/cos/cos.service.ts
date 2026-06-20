import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface CosPolicy {
  cosSecretId: string;
  policy: string;
  signature: string;
  host: string;
  dir: string;
  expire: number;
}

@Injectable()
export class CosService {
  constructor(private config: ConfigService) {}

  // 生成 COS PostObject 直传签名（前端使用 wx.uploadFile）
  buildUploadPolicy(userId: string, expireSeconds = 600): CosPolicy {
    const secretId = this.config.get<string>('COS_SECRET_ID')!;
    const secretKey = this.config.get<string>('COS_SECRET_KEY')!;
    const bucket = this.config.get<string>('COS_BUCKET')!;
    const region = this.config.get<string>('COS_REGION')!;

    const expire = Math.floor(Date.now() / 1000) + expireSeconds;
    const dir = `users/${userId}/`;

    // COS PostObject 签名格式（与 AWS S3 一致）
    const policyText = JSON.stringify({
      expiration: new Date(expire * 1000).toISOString(),
      conditions: [
        { bucket },
        ['starts-with', '$key', dir],
        ['content-length-range', 0, 20 * 1024 * 1024], // 单文件最大 20MB
      ],
    });
    const policy = Buffer.from(policyText).toString('base64');
    const signature = crypto
      .createHmac('sha1', secretKey)
      .update(policy)
      .digest('base64');

    return {
      cosSecretId: secretId,
      policy,
      signature,
      host: `https://${bucket}.cos.${region}.myqcloud.com`,
      dir,
      expire,
    };
  }
}
