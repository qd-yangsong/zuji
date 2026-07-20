import { View, Text, ScrollView } from '@tarojs/components';
import { useState, useMemo } from 'react';
import {
  ALL_STICKERS,
  CATEGORY_LABELS,
  getStickersByZone,
  isStickerUnlocked,
  type Sticker,
  type StickerZone,
  type StickerCategory,
} from '../../stickers/stickerData';
import './index.scss';

interface StickerBookProps {
  visible: boolean;
  unlockedIds: string[]; // 已解锁的纪念/荣誉贴纸 ID
  selectedIds?: string[]; // 当前已选中的贴纸
  maxSelect?: number; // 最大可选数量
  onClose: () => void;
  onConfirm: (stickerIds: string[]) => void;
}

// 贴纸本：三区结构（基础 / 纪念 / 荣誉）
export default function StickerBook({
  visible,
  unlockedIds,
  selectedIds = [],
  maxSelect = 3,
  onClose,
  onConfirm,
}: StickerBookProps) {
  const [activeZone, setActiveZone] = useState<StickerZone>('basic');
  const [activeCategory, setActiveCategory] = useState<StickerCategory | 'all'>('all');
  const [selected, setSelected] = useState<string[]>(selectedIds);

  // 当前区域的贴纸
  const zoneStickers = useMemo(() => getStickersByZone(activeZone), [activeZone]);

  // 基础区域按分类过滤
  const displayStickers = useMemo(() => {
    if (activeZone === 'basic' && activeCategory !== 'all') {
      return zoneStickers.filter((s) => s.category === activeCategory);
    }
    return zoneStickers;
  }, [zoneStickers, activeZone, activeCategory]);

  if (!visible) return null;

  const handleToggle = (sticker: Sticker) => {
    if (!isStickerUnlocked(sticker, unlockedIds)) return;
    setSelected((prev) => {
      if (prev.includes(sticker.id)) {
        return prev.filter((id) => id !== sticker.id);
      }
      if (prev.length >= maxSelect) {
        return prev;
      }
      return [...prev, sticker.id];
    });
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  const zones: { key: StickerZone; label: string }[] = [
    { key: 'basic', label: '📦 基础' },
    { key: 'memory', label: '🏆 纪念' },
    { key: 'honor', label: '👑 荣誉' },
  ];

  const categories: { key: StickerCategory | 'all'; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'cute', label: CATEGORY_LABELS.cute },
    { key: 'funny', label: CATEGORY_LABELS.funny },
    { key: 'romantic', label: CATEGORY_LABELS.romantic },
    { key: 'beauty', label: CATEGORY_LABELS.beauty },
    { key: 'emotion', label: CATEGORY_LABELS.emotion },
    { key: 'scene', label: CATEGORY_LABELS.scene },
  ];

  return (
    <View className='sticker-book' onClick={onClose}>
      <View className='sticker-book__panel' catchMove onClick={(e) => e.stopPropagation()}>
        {/* 顶部 */}
        <View className='sticker-book__header'>
          <Text className='sticker-book__title'>贴纸本</Text>
          <Text className='sticker-book__close' onClick={onClose}>×</Text>
        </View>

        {/* 三区 Tab */}
        <View className='sticker-book__zones'>
          {zones.map((z) => {
            const count = getStickersByZone(z.key).length;
            const unlockedCount = z.key === 'basic'
              ? count
              : getStickersByZone(z.key).filter((s) => isStickerUnlocked(s, unlockedIds)).length;
            return (
              <View
                key={z.key}
                className={`sticker-book__zone ${activeZone === z.key ? 'sticker-book__zone--active' : ''}`}
                onClick={() => setActiveZone(z.key)}
              >
                <Text>{z.label}</Text>
                <Text className='sticker-book__zone-count'>{unlockedCount}/{count}</Text>
              </View>
            );
          })}
        </View>

        {/* 基础区分类 Tab */}
        {activeZone === 'basic' && (
          <ScrollView className='sticker-book__categories' scrollX>
            {categories.map((c) => (
              <View
                key={c.key}
                className={`sticker-book__category ${activeCategory === c.key ? 'sticker-book__category--active' : ''}`}
                onClick={() => setActiveCategory(c.key)}
              >
                <Text>{c.label}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* 贴纸网格 */}
        <ScrollView className='sticker-book__grid-wrap' scrollY>
          <View className='sticker-book__grid'>
            {displayStickers.map((sticker) => {
              const unlocked = isStickerUnlocked(sticker, unlockedIds);
              const isSelected = selected.includes(sticker.id);
              return (
                <View
                  key={sticker.id}
                  className={`sticker-book__item ${!unlocked ? 'sticker-book__item--locked' : ''} ${isSelected ? 'sticker-book__item--selected' : ''}`}
                  onClick={() => handleToggle(sticker)}
                >
                  <View
                    className='sticker-book__svg'
                    dangerouslySetInnerHTML={{ __html: sticker.svg }}
                  />
                  {!unlocked && <View className='sticker-book__lock'>🔒</View>}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* 底部操作 */}
        <View className='sticker-book__footer'>
          <View className='sticker-book__selected-preview'>
            {selected.map((id) => {
              const s = ALL_STICKERS.find((x) => x.id === id);
              return s ? (
                <View
                  key={id}
                  className='sticker-book__preview-item'
                  dangerouslySetInnerHTML={{ __html: s.svg }}
                />
              ) : null;
            })}
          </View>
          <View className='sticker-book__actions'>
            <Text className='sticker-book__count'>{selected.length}/{maxSelect}</Text>
            <View className='sticker-book__confirm-btn' onClick={handleConfirm}>
              <Text>贴上 ({selected.length})</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
