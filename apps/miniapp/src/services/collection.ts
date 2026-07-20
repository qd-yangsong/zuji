import { request } from './request';
import type { CollectionDto, CreateCollectionDto, JourneyMarkerDto } from '@zuji/shared-types';

// 获取旅程地图标记点
export async function fetchJourneyMap(): Promise<JourneyMarkerDto[]> {
  return request<JourneyMarkerDto[]>({ url: '/places/journey/map', method: 'GET' });
}

// 获取合集列表
export async function fetchCollections(): Promise<CollectionDto[]> {
  return request<CollectionDto[]>({ url: '/collections', method: 'GET' });
}

// 获取合集详情
export async function fetchCollectionDetail(id: string): Promise<CollectionDto> {
  return request<CollectionDto>({ url: `/collections/${id}`, method: 'GET' });
}

// 创建合集
export async function createCollection(dto: CreateCollectionDto): Promise<CollectionDto> {
  return request<CollectionDto>({ url: '/collections', method: 'POST', data: dto });
}

// 更新合集
export async function updateCollection(id: string, dto: Partial<CreateCollectionDto>): Promise<CollectionDto> {
  return request<CollectionDto>({ url: `/collections/${id}`, method: 'PATCH', data: dto });
}

// 删除合集
export async function deleteCollection(id: string): Promise<void> {
  await request({ url: `/collections/${id}`, method: 'DELETE' });
}

// 添加地点到合集
export async function addPlaceToCollection(collectionId: string, placeId: string): Promise<CollectionDto> {
  return request<CollectionDto>({ url: `/collections/${collectionId}/places`, method: 'POST', data: { placeId } });
}

// 从合集中移除地点
export async function removePlaceFromCollection(collectionId: string, placeId: string): Promise<void> {
  await request({ url: `/collections/${collectionId}/places/${placeId}`, method: 'DELETE' });
}
