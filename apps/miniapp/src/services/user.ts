import { request } from './request';

// 获取已解锁的贴纸列表
export async function fetchStickerUnlocks(): Promise<{ stickerUnlocks: string[] }> {
  return request<{ stickerUnlocks: string[] }>({ url: '/user/stickers', method: 'GET' });
}

// 解锁单个贴纸
export async function unlockSticker(stickerId: string): Promise<{ stickerUnlocks: string[]; alreadyUnlocked: boolean }> {
  return request({ url: '/user/stickers/unlock', method: 'POST', data: { stickerId } });
}

// 批量解锁贴纸
export async function unlockStickers(stickerIds: string[]): Promise<{ stickerUnlocks: string[] }> {
  return request({ url: '/user/stickers/unlock-batch', method: 'POST', data: { stickerIds } });
}

// 更新签名
export async function updateSignature(signature: string): Promise<{ id: string; nickname: string; avatarUrl: string; signature: string }> {
  return request({ url: '/user/signature', method: 'PATCH', data: { signature } });
}
