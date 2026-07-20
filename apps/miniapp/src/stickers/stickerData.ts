// 足迹手帐 - 贴纸库
// 纯 SVG inline 渲染，无图片依赖
// 三区结构：基础（全量开放）+ 纪念（旅程解锁）+ 荣誉（成就解锁）

export type StickerCategory = 'cute' | 'funny' | 'romantic' | 'beauty' | 'emotion' | 'scene';
export type StickerZone = 'basic' | 'memory' | 'honor';

export interface Sticker {
  id: string;
  name: string;
  category: StickerCategory;
  zone: StickerZone;
  svg: string; // SVG 内容
}

// 分类标签
export const CATEGORY_LABELS: Record<StickerCategory, string> = {
  cute: '🌸 可爱',
  funny: '😜 搞怪',
  romantic: '💕 浪漫',
  beauty: '☀️ 美好',
  emotion: '🎭 情绪',
  scene: '☕ 场景',
};

// 生成简单 SVG 贴纸的辅助函数
const svg = (content: string, bg = '#FFE4B5') =>
  `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="22" fill="${bg}" opacity="0.3"/>${content}</svg>`;

// ===== 基础贴纸（60 款，全量开放）=====

const basicStickers: Sticker[] = [
  // 🌸 可爱 (10款)
  { id: 'cute-1', name: '小猫', category: 'cute', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🐱</text>') },
  { id: 'cute-2', name: '小熊', category: 'cute', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🐻</text>') },
  { id: 'cute-3', name: '兔子', category: 'cute', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🐰</text>') },
  { id: 'cute-4', name: '冰淇淋', category: 'cute', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🍦</text>', '#FFE0E6') },
  { id: 'cute-5', name: '小饼干', category: 'cute', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🍪</text>', '#F5DEB3') },
  { id: 'cute-6', name: '泡泡', category: 'cute', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🫧</text>', '#E0F4FF') },
  { id: 'cute-7', name: '蝴蝶', category: 'cute', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🦋</text>', '#FFE4F0') },
  { id: 'cute-8', name: '草莓', category: 'cute', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🍓</text>', '#FFE0E0') },
  { id: 'cute-9', name: '蛋糕', category: 'cute', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🍰</text>', '#FFF0E6') },
  { id: 'cute-10', name: '小鸭', category: 'cute', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🦆</text>', '#FFF8DC') },

  // 😜 搞怪 (8款)
  { id: 'funny-1', name: '翻白眼', category: 'funny', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🙄</text>', '#F0F0F0') },
  { id: 'funny-2', name: '叉腰', category: 'funny', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">😤</text>', '#FFE4C4') },
  { id: 'funny-3', name: '问号脸', category: 'funny', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">❓</text>', '#F5F5DC') },
  { id: 'funny-4', name: '惊讶', category: 'funny', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">😮</text>', '#FFEFD5') },
  { id: 'funny-5', name: '坏笑', category: 'funny', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">😏</text>', '#F0E6FF') },
  { id: 'funny-6', name: '笑哭', category: 'funny', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">😂</text>', '#FFFACD') },
  { id: 'funny-7', name: '思考', category: 'funny', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🤔</text>', '#E6E6FA') },
  { id: 'funny-8', name: '尴尬', category: 'funny', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">😅</text>', '#FFF8E0') },

  // 💕 浪漫 (10款)
  { id: 'rom-1', name: '爱心', category: 'romantic', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">❤️</text>', '#FFE4E1') },
  { id: 'rom-2', name: '月亮', category: 'romantic', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🌙</text>', '#E6E6FA') },
  { id: 'rom-3', name: '星星', category: 'romantic', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">⭐</text>', '#FFFACD') },
  { id: 'rom-4', name: '玫瑰', category: 'romantic', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🌹</text>', '#FFE4E1') },
  { id: 'rom-5', name: '信封', category: 'romantic', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">💌</text>', '#FFF8DC') },
  { id: 'rom-6', name: '彩虹', category: 'romantic', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🌈</text>', '#F0F8FF') },
  { id: 'rom-7', name: '闪光', category: 'romantic', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">✨</text>', '#FFFACD') },
  { id: 'rom-8', name: '钻石', category: 'romantic', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">💎</text>', '#E0FFFF') },
  { id: 'rom-9', name: '丝带', category: 'romantic', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🎀</text>', '#FFE4E1') },
  { id: 'rom-10', name: '烟花', category: 'romantic', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🎆</text>', '#FFFAF0') },

  // ☀️ 美好 (10款)
  { id: 'beauty-1', name: '阳光', category: 'beauty', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">☀️</text>', '#FFFACD') },
  { id: 'beauty-2', name: '云朵', category: 'beauty', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">☁️</text>', '#F0F8FF') },
  { id: 'beauty-3', name: '花朵', category: 'beauty', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🌸</text>', '#FFE4F0') },
  { id: 'beauty-4', name: '向日葵', category: 'beauty', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🌻</text>', '#FFFACD') },
  { id: 'beauty-5', name: '四叶草', category: 'beauty', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🍀</text>', '#F0FFF0') },
  { id: 'beauty-6', name: '贝壳', category: 'beauty', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🐚</text>', '#FFF5EE') },
  { id: 'beauty-7', name: '热气球', category: 'beauty', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🎈</text>', '#FFE4E1') },
  { id: 'beauty-8', name: '许愿瓶', category: 'beauty', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🔮</text>', '#E6E6FA') },
  { id: 'beauty-9', name: '风铃', category: 'beauty', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🎐</text>', '#F0F8FF') },
  { id: 'beauty-10', name: '枫叶', category: 'beauty', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🍁</text>', '#FFE4C4') },

  // 🎭 情绪化 (8款)
  { id: 'emo-1', name: '开心', category: 'emotion', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">😊</text>', '#FFFACD') },
  { id: 'emo-2', name: '感动', category: 'emotion', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🥹</text>', '#FFE4E1') },
  { id: 'emo-3', name: '感叹', category: 'emotion', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">❗</text>', '#FFF8DC') },
  { id: 'emo-4', name: '省略', category: 'emotion', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">💬</text>', '#F0F8FF') },
  { id: 'emo-5', name: '心碎', category: 'emotion', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">💔</text>', '#FFE4E1') },
  { id: 'emo-6', name: '生气', category: 'emotion', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">💢</text>', '#FFE4C4') },
  { id: 'emo-7', name: '疲惫', category: 'emotion', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">😴</text>', '#E6E6FA') },
  { id: 'emo-8', name: '期待', category: 'emotion', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🤩</text>', '#FFFACD') },

  // ☕ 场景 (14款)
  { id: 'scene-1', name: '咖啡', category: 'scene', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">☕</text>', '#F5DEB3') },
  { id: 'scene-2', name: '书', category: 'scene', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">📖</text>', '#FFF8DC') },
  { id: 'scene-3', name: '相机', category: 'scene', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">📷</text>', '#F0F0F0') },
  { id: 'scene-4', name: '行李箱', category: 'scene', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🧳</text>', '#FFE4C4') },
  { id: 'scene-5', name: '电影票', category: 'scene', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🎟️</text>', '#FFFACD') },
  { id: 'scene-6', name: '音乐', category: 'scene', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🎵</text>', '#E6E6FA') },
  { id: 'scene-7', name: '美食', category: 'scene', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🍽️</text>', '#FFF8DC') },
  { id: 'scene-8', name: '啤酒', category: 'scene', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🍺</text>', '#FFE4B5') },
  { id: 'scene-9', name: '购物', category: 'scene', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🛍️</text>', '#FFE4E1') },
  { id: 'scene-10', name: '公园', category: 'scene', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🌳</text>', '#F0FFF0') },
  { id: 'scene-11', name: '海滩', category: 'scene', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🏖️</text>', '#F0F8FF') },
  { id: 'scene-12', name: '山脉', category: 'scene', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">⛰️</text>', '#F5DEB3') },
  { id: 'scene-13', name: '城市', category: 'scene', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🏙️</text>', '#E6E6FA') },
  { id: 'scene-14', name: '夜晚', category: 'scene', zone: 'basic', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🌃</text>', '#E6E6FA') },
];

// ===== 纪念贴纸（旅程解锁，5款示例）=====
const memoryStickers: Sticker[] = [
  { id: 'mem-1', name: '飞机', category: 'scene', zone: 'memory', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">✈️</text>', '#E0F4FF') },
  { id: 'mem-2', name: '火车', category: 'scene', zone: 'memory', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🚂</text>', '#FFE4C4') },
  { id: 'mem-3', name: '岛屿', category: 'scene', zone: 'memory', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🏝️</text>', '#F0FFFF') },
  { id: 'mem-4', name: '雪', category: 'beauty', zone: 'memory', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">❄️</text>', '#F0F8FF') },
  { id: 'mem-5', name: '日落', category: 'beauty', zone: 'memory', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🌇</text>', '#FFE4B5') },
];

// ===== 荣誉贴纸（成就解锁，示例 5款）=====
const honorStickers: Sticker[] = [
  { id: 'honor-1', name: '金牌', category: 'beauty', zone: 'honor', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🥇</text>', '#FFD700') },
  { id: 'honor-2', name: '奖杯', category: 'beauty', zone: 'honor', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🏆</text>', '#FFD700') },
  { id: 'honor-3', name: '皇冠', category: 'beauty', zone: 'honor', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">👑</text>', '#FFD700') },
  { id: 'honor-4', name: '勋章', category: 'beauty', zone: 'honor', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">🎖️</text>', '#FFD700') },
  { id: 'honor-5', name: '戒指', category: 'beauty', zone: 'honor', svg: svg('<text x="24" y="32" font-size="28" text-anchor="middle">💍</text>', '#FFD700') },
];

// 全部贴纸合集
export const ALL_STICKERS: Sticker[] = [...basicStickers, ...memoryStickers, ...honorStickers];

// 按 ID 查找贴纸
export const getStickerById = (id: string): Sticker | undefined =>
  ALL_STICKERS.find((s) => s.id === id);

// 按区域获取贴纸
export const getStickersByZone = (zone: StickerZone): Sticker[] =>
  ALL_STICKERS.filter((s) => s.zone === zone);

// 按分类获取基础贴纸
export const getBasicStickersByCategory = (category?: StickerCategory): Sticker[] => {
  const basic = ALL_STICKERS.filter((s) => s.zone === 'basic');
  return category ? basic.filter((s) => s.category === category) : basic;
};

// 检查贴纸是否已解锁
export const isStickerUnlocked = (sticker: Sticker, unlockedIds: string[]): boolean => {
  if (sticker.zone === 'basic') return true;
  return unlockedIds.includes(sticker.id);
};
