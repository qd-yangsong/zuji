import { request } from './request';
import type { CheckInDto, CreateCheckInDto } from '@zuji/shared-types';

// 创建打卡
export async function createCheckin(dto: CreateCheckInDto): Promise<CheckInDto> {
  return request<CheckInDto>({ url: '/checkins', method: 'POST', data: dto });
}

// 获取某地点的打卡时间轴
export async function fetchCheckins(placeId: string): Promise<CheckInDto[]> {
  return request<CheckInDto[]>({ url: `/checkins/place/${placeId}`, method: 'GET' });
}

// 删除打卡
export async function deleteCheckin(checkinId: string): Promise<void> {
  await request({ url: `/checkins/${checkinId}`, method: 'DELETE' });
}
