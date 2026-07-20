import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface CosPolicy {
  cosSecretId: string;
  policy: string;
  signature: string;
  keyTime: string;
  host: string;
  dir: string;
  expire: number;
}

@Injectable()
export class CosService {
  constructor(private config: ConfigService) {}

  // 生成 COS PostObject 直传签名（COS 原生签名格式）
  buildUploadPolicy(userId: string, expireSeconds = 600): CosPolicy {
    const secretId = this.config.get<string>('COS_SECRET_ID')!;
    const secretKey = this.config.get<string>('COS_SECRET_KEY')!;
    const bucket = this.config.get<string>('COS_BUCKET')!;
    const region = this.config.get<string>('COS_REGION')!;

    const startTime = Math.floor(Date.now() / 1000);
    const expire = startTime + expireSeconds;
    const keyTime = `${startTime};${expire}`;
    const dir = `users/${userId}/`;

    // COS PostObject policy（conditions 必须包含三个签名字段）
    const policyText = JSON.stringify({
      expiration: new Date(expire * 1000).toISOString(),
      conditions: [
        { bucket },
        ['starts-with', '$key', dir],
        ['content-length-range', 0, 20 * 1024 * 1024],
        { 'q-sign-algorithm': 'sha1' },
        { 'q-ak': secretId },
        { 'q-sign-time': keyTime },
      ],
    });
    const policy = Buffer.from(policyText).toString('base64');

    // COS PostObject 签名算法（官方文档: https://cloud.tencent.com/document/product/436/14690）
    // 1. SignKey = HMAC-SHA1(SecretKey, KeyTime) -> hex
    const signKey = crypto
      .createHmac('sha1', secretKey)
      .update(keyTime)
      .digest('hex');

    // 2. StringToSign = SHA1(policyText) -> hex（对原始 JSON 文本做 SHA1，不是 base64）
    const stringToSign = crypto.createHash('sha1').update(policyText).digest('hex');

    // 3. Signature = HMAC-SHA1(SignKey, StringToSign) -> hex
    const signature = crypto
      .createHmac('sha1', signKey)
      .update(stringToSign)
      .digest('hex');

    return {
      cosSecretId: secretId,
      policy,
      signature,
      keyTime,
      host: `https://${bucket}.cos.${region}.myqcloud.com`,
      dir,
      expire,
    };
  }
}
