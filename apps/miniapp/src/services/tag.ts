import { request } from './request';
import type { TagDto, TagGroupDto, CreateTagDto, TagType } from '@zuji/shared-types';

// 按类型获取标签（系统预设 + 用户自定义）
export async function fetchTags(type: TagType): Promise<TagDto[]> {
  return request<TagDto[]>({ url: '/tags', method: 'GET', data: { type } });
}

// 创建自定义标签
export async function createTag(dto: CreateTagDto): Promise<TagDto> {
  return request<TagDto>({ url: '/tags', method: 'POST', data: dto });
}

// 删除自定义标签
export async function deleteTag(tagId: string): Promise<void> {
  await request({ url: `/tags/${tagId}`, method: 'DELETE' });
}

// 获取标签组（含组内标签）
export async function fetchTagGroups(tagType?: string): Promise<TagGroupDto[]> {
  return request<TagGroupDto[]>({
    url: '/tag-groups',
    method: 'GET',
    data: tagType ? { tagType } : undefined,
  });
}

// 创建自定义标签组
export async function createTagGroup(dto: {
  name: string;
  color?: string;
  icon?: string;
  tagType: TagType;
}): Promise<TagGroupDto> {
  return request<TagGroupDto>({ url: '/tag-groups', method: 'POST', data: dto });
}
