import { request } from './request';
import type { PlaceDto, CollectionDto } from '@zuji/shared-types';

// 公开接口：查看分享的地点（不需要登录）
export async function fetchSharedPlace(placeId: string): Promise<PlaceDto> {
  return request<PlaceDto>({
    url: `/share/place/${placeId}`,
    method: 'GET',
    needAuth: false,
  });
}

// 公开接口：查看分享的合集（不需要登录）
export async function fetchSharedCollection(collectionId: string): Promise<CollectionDto> {
  return request<CollectionDto>({
    url: `/share/collection/${collectionId}`,
    method: 'GET',
    needAuth: false,
  });
}
