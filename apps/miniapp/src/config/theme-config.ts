/**
 * 主题配置 -- 本地默认主题池
 *
 * 纯 CSS 视觉方案：每主题 = 渐变色 + CSS 几何图形 + accent/light 配色
 * 零图片依赖，永不失真。
 * 后续切换为后台管理远程配置时，只需 ResourceService.setSource('remote')。
 */
import type { ThemeResource } from '@zuji/shared-types';

export const LOCAL_THEME_POOL: ThemeResource[] = [
  {
    id: 'night',
    gradient: 'linear-gradient(160deg, #a8a8d0 0%, #7c7cb8 100%)',
    accent: '#5a5a8e',
    light: '#e8e8f5',
    geoType: 'night',
  },
  {
    id: 'coffee',
    gradient: 'linear-gradient(160deg, #f5deb3 0%, #d4a96a 100%)',
    accent: '#8b6914',
    light: '#fdf5e6',
    geoType: 'coffee',
  },
  {
    id: 'park',
    gradient: 'linear-gradient(160deg, #c8e6c9 0%, #81c784 100%)',
    accent: '#2e7d32',
    light: '#e8f5e9',
    geoType: 'park',
  },
  {
    id: 'gather',
    gradient: 'linear-gradient(160deg, #e1bee7 0%, #ce93d8 100%)',
    accent: '#7b1fa2',
    light: '#f3e5f5',
    geoType: 'gather',
  },
  {
    id: 'stay',
    gradient: 'linear-gradient(160deg, #ffe0b2 0%, #ffb74d 100%)',
    accent: '#e65100',
    light: '#fff3e0',
    geoType: 'stay',
  },
  {
    id: 'exhibit',
    gradient: 'linear-gradient(160deg, #b3e5fc 0%, #64b5f6 100%)',
    accent: '#1565c0',
    light: '#e3f2fd',
    geoType: 'exhibit',
  },
];

// 当前配置版本号（远程配置更新时递增，用于缓存失效）
export const THEME_CONFIG_VERSION = '2.0.0';
