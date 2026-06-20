import { request } from './request';
import type { PlaceDto, CreatePlaceDto, QueryPlaceDto } from '@zuji/shared-types';

interface PlaceListResponse {
  list: PlaceDto[];
  total: number;
  page: number;
  pageSize: number;
}

// 查询地点列表
export async function fetchPlaces(query?: QueryPlaceDto): Promise<PlaceListResponse> {
  return request<PlaceListResponse>({ url: '/places', method: 'GET', data: query });
}

// 获取地点详情
export async function fetchPlaceDetail(placeId: string): Promise<PlaceDto> {
  return request<PlaceDto>({ url: `/places/${placeId}`, method: 'GET' });
}

// 创建地点
export async function createPlace(dto: CreatePlaceDto): Promise<PlaceDto> {
  return request<PlaceDto>({ url: '/places', method: 'POST', data: dto });
}

// 更新地点
export async function updatePlace(placeId: string, dto: Partial<CreatePlaceDto>): Promise<PlaceDto> {
  return request<PlaceDto>({ url: `/places/${placeId}`, method: 'PATCH', data: dto });
}

// 删除地点
export async function deletePlace(placeId: string): Promise<void> {
  await request({ url: `/places/${placeId}`, method: 'DELETE' });
}
