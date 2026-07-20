import { request } from './request';
import type { PlaceDto, CreatePlaceDto, QueryPlaceDto, NearbyPlaceDto, TimelineEntryDto, YearSummaryDto } from '@zuji/shared-types';

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

// 创建地点（收藏即记录）
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

// 模糊搜索地点
export async function searchPlaces(keyword: string): Promise<PlaceDto[]> {
  return request<PlaceDto[]>({ url: '/places/search', method: 'GET', data: { q: keyword } });
}

// 附近已收藏地点匹配
export async function findNearbyPlaces(lat: number, lng: number, radius?: number): Promise<NearbyPlaceDto[]> {
  return request<NearbyPlaceDto[]>({ url: '/places/nearby', method: 'GET', data: { lat, lng, radius } });
}

// 旅程时间线
export async function fetchTimeline(year?: number): Promise<TimelineEntryDto[]> {
  return request<TimelineEntryDto[]>({ url: '/places/timeline', method: 'GET', data: { year } });
}

// 年度足迹总结
export async function fetchYearSummary(year?: number): Promise<YearSummaryDto> {
  return request<YearSummaryDto>({ url: '/places/summary', method: 'GET', data: { year } });
}
