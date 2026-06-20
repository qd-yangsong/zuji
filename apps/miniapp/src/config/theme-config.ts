/**
 * 主题配置 —— 本地默认主题池
 *
 * 当前阶段用 emoji 作为装饰占位。
 * 后续替换为图片资源时，只需在 ThemeResource.illustUrl / decoUrl 填入路径，
 * 前端 ThemeImage 组件会自动优先使用图片，emoji 作为降级。
 */
import type { ThemeResource } from '@zuji/shared-types';

export const LOCAL_THEME_POOL: ThemeResource[] = [
  // 夜 - 深蓝星空
  {
    id: 'night',
    bg: '#3B4B7A',
    gradient: 'linear-gradient(135deg, #ff9a8b 0%, #ff6a88 50%, #ff99ac 100%)',
    iconBg: '#FFFFFF',
    iconColor: '#3B4B7A',
    emoji: '🌙',
    deco: '✨',
  },
  // 咖 - 浅米色
  {
    id: 'coffee',
    bg: '#F4E4C1',
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    iconBg: '#8B5A2B',
    iconColor: '#FFFFFF',
    emoji: '☕',
    deco: '☁️',
  },
  // 园 - 浅绿色
  {
    id: 'park',
    bg: '#C8E6C9',
    gradient: 'linear-gradient(135deg, #a8e6cf 0%, #56ab2f 100%)',
    iconBg: '#4CAF50',
    iconColor: '#FFFFFF',
    emoji: '🌳',
    deco: '⭐️',
  },
  // 聚 - 紫色
  {
    id: 'gather',
    bg: '#E1BEE7',
    gradient: 'linear-gradient(135deg, #d4a5ff 0%, #b06ab3 100%)',
    iconBg: '#9C27B0',
    iconColor: '#FFFFFF',
    emoji: '🥰',
    deco: '💕',
  },
  // 宿 - 橘色
  {
    id: 'stay',
    bg: '#FFE0B2',
    gradient: 'linear-gradient(135deg, #ffd194 0%, #ff9a44 100%)',
    iconBg: '#FF9800',
    iconColor: '#FFFFFF',
    emoji: '🧳',
    deco: '🟠',
  },
  // 展 - 浅蓝
  {
    id: 'exhibit',
    bg: '#B3E5FC',
    gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    iconBg: '#03A9F4',
    iconColor: '#FFFFFF',
    emoji: '🖼️',
    deco: '💎',
  },
];

// 当前配置版本号（远程配置更新时递增，用于缓存失效）
export const THEME_CONFIG_VERSION = '1.0.0';
