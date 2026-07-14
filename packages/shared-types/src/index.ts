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
  // 审核状态：passed | pending | rejected（后端默认 passed，老数据兼容为可选）
  reviewStatus?: string;
  reviewReason?: string | null;
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

// ========== 资源与主题类型 ==========

// 主题资源：纯 CSS 视觉方案
// 每主题 = 渐变色 + CSS 几何图形 + accent/light 配色，零图片依赖
export interface ThemeResource {
  id: string;              // 主题唯一标识：night/coffee/park/gather/stay/exhibit
  gradient: string;        // CSS 渐变背景
  accent: string;          // 主题强调色（标签文字、首字徽章文字色）
  light: string;           // 浅色背景（标签底色）
  geoType: string;         // CSS 几何图形类型：night/coffee/park/gather/stay/exhibit
}

// 远程主题配置响应（第二阶段：从服务端下发）
export interface ThemeConfigResponse {
  version: string;              // 配置版本号，用于缓存失效判断
  themes: ThemeResource[];
  updatedAt: string;
}

// Place 预留扩展字段（后续用户可自定义主题）
// 在 PlaceDto 中追加可选字段，当前后端不返回，前端按需使用
export interface PlaceThemeExtension {
  themeId?: string;             // 用户指定的主题 ID（不指定则按名称哈希）
}

// ========== 打卡记录类型 ==========

// 打卡记录
export interface CheckInDto {
  id: string;
  placeId: string;
  userId: string;
  content: string | null;
  images: string[];
  isFirst: boolean;
  checkinAt: string;
  createdAt: string;
  updatedAt: string;
  tags: TagDto[];
  // 审核状态：passed | pending | rejected（后端默认 passed，老数据兼容为可选）
  reviewStatus?: string;
  reviewReason?: string | null;
}

// 创建打卡请求
export interface CreateCheckInDto {
  placeId: string;
  content?: string;
  images?: string[];
  eventTagIds: string[];
}

// ========== 地点合集类型 ==========

// 地点合集
export interface CollectionDto {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  places: PlaceDto[];
}

// 创建合集请求
export interface CreateCollectionDto {
  name: string;
  description?: string;
  coverImage?: string;
  placeIds?: string[];
}

// 旅程地图标记点（由后端聚合 CheckIn + Place 生成）
export interface JourneyMarkerDto {
  placeId: string;
  customName: string;
  realName: string;
  latitude: number;
  longitude: number;
  checkinCount: number;
  lastCheckinAt: string | null;
}
