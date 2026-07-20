import { request } from './request';
import type { RouteDto, CreateRouteDto } from '@zuji/shared-types';

// 获取路线列表
export async function fetchRoutes(type?: string): Promise<RouteDto[]> {
  return request<RouteDto[]>({ url: '/routes', method: 'GET', data: { type } });
}

// 获取路线详情
export async function fetchRouteDetail(routeId: string): Promise<RouteDto> {
  return request<RouteDto>({ url: `/routes/${routeId}`, method: 'GET' });
}

// 创建路线
export async function createRoute(dto: CreateRouteDto): Promise<RouteDto> {
  return request<RouteDto>({ url: '/routes', method: 'POST', data: dto });
}

// 更新路线
export async function updateRoute(routeId: string, dto: Partial<CreateRouteDto>): Promise<RouteDto> {
  return request<RouteDto>({ url: `/routes/${routeId}`, method: 'PATCH', data: dto });
}

// 删除路线
export async function deleteRoute(routeId: string): Promise<void> {
  await request({ url: `/routes/${routeId}`, method: 'DELETE' });
}

// 添加地点到路线
export async function addPlaceToRoute(routeId: string, dto: { placeId: string; dayLabel?: string; notes?: string }): Promise<RouteDto> {
  return request<RouteDto>({ url: `/routes/${routeId}/places`, method: 'POST', data: dto });
}

// 从路线移除地点
export async function removePlaceFromRoute(routeId: string, placeId: string): Promise<void> {
  await request({ url: `/routes/${routeId}/places/${placeId}`, method: 'DELETE' });
}

// 重排序路线地点
export async function reorderRoutePlaces(routeId: string, placeIds: string[]): Promise<RouteDto> {
  return request<RouteDto>({ url: `/routes/${routeId}/reorder`, method: 'PATCH', data: { placeIds } });
}

// 完成旅程
export async function completeJourney(routeId: string): Promise<RouteDto> {
  return request<RouteDto>({ url: `/routes/${routeId}/complete`, method: 'POST' });
}
