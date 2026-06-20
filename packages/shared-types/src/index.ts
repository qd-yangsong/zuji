// 前后端共享的类型定义

// 通用接口响应封装
export interface ApiError {
  statusCode: number;
  message: string;
}

// 用户基本信息
export interface UserDto {
  id: string;
  openid: string;
  nickname?: string;
  avatarUrl?: string;
}

// 登录返回
export interface LoginResponseDto {
  token: string;
  user: UserDto;
}

// 标签类型枚举
export type TagType = 'attribute' | 'scene' | 'event';

// 标签组
export interface TagGroupDto {
  id: string;
  userId: string | null;
  name: string;
  color: string | null;
  icon: string | null;
  tagType: TagType;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// 标签
export interface TagDto {
  id: string;
  userId: string | null;
  name: string;
  type: TagType;
  groupId: string | null;
  isSystem: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// 创建标签请求
export interface CreateTagDto {
  name: string;
  type: TagType;
  groupId?: string;
}

// 创建标签组请求
export interface CreateTagGroupDto {
  name: string;
  color?: string;
  icon?: string;
  tagType: TagType;
}

// 地点信息
export interface PlaceDto {
  id: string;
  userId: string;
  realName: string;
  customName: string;
  latitude: number;
  longitude: number;
  address: string | null;
  coverImage: string | null;
  checkinCount: number;
  collectedAt: string;
  createdAt: string;
  updatedAt: string;
  tags: TagDto[];
}

// 创建地点请求
export interface CreatePlaceDto {
  realName: string;
  customName: string;
  latitude: number;
  longitude: number;
  address?: string;
  coverImage?: string;
  attributeTagIds: string[];
  sceneTagIds: string[];
}

// 查询地点请求
export interface QueryPlaceDto {
  sort?: 'recent' | 'year' | 'date' | 'checkin';
  tagId?: string;
  page?: number;
  pageSize?: number;
}
