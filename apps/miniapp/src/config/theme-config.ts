/**
 * 主题配置 —— 本地默认主题池
 *
 * 已接入本地插画图片素材，ThemeImage 组件会优先使用 illustUrl / decoUrl，
 * emoji 作为降级兜底。
 * 后续切换为远程配置时，只需在后台管理发布主题版本，
 * ResourceService.setSource('remote') 即可自动拉取，无需改调用方代码。
 */
import type { ThemeResource } from '@zuji/shared-types';

// 本地图片资源（Taro/webpack 通过 require 处理本地图片）
import nightIllust from '../assets/theme-illust/night.png';
import coffeeIllust from '../assets/theme-illust/coffee.png';
import parkIllust from '../assets/theme-illust/park.png';
import gatherIllust from '../assets/theme-illust/gather.png';
import stayIllust from '../assets/theme-illust/stay.png';
import exhibitIllust from '../assets/theme-illust/exhibit.png';

import nightDeco from '../assets/theme-deco/night.png';
import coffeeDeco from '../assets/theme-deco/coffee.png';
import parkDeco from '../assets/theme-deco/park.png';
import gatherDeco from '../assets/theme-deco/gather.png';
import stayDeco from '../assets/theme-deco/stay.png';
import exhibitDeco from '../assets/theme-deco/exhibit.png';

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
    illustUrl: nightIllust,
    decoUrl: nightDeco,
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
    illustUrl: coffeeIllust,
    decoUrl: coffeeDeco,
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
    illustUrl: parkIllust,
    decoUrl: parkDeco,
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
    illustUrl: gatherIllust,
    decoUrl: gatherDeco,
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
    illustUrl: stayIllust,
    decoUrl: stayDeco,
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
    illustUrl: exhibitIllust,
    decoUrl: exhibitDeco,
  },
];

// 当前配置版本号（远程配置更新时递增，用于缓存失效）
export const THEME_CONFIG_VERSION = '1.0.0';
