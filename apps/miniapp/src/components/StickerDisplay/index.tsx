import { View } from '@tarojs/components';
import { getStickerById } from '../../stickers/stickerData';
import './index.scss';

interface StickerDisplayProps {
  stickerIds: string[];
  size?: 'small' | 'medium' | 'large';
  max?: number; // 最多显示几个
}

// 贴纸展示：在卡片角标 / 打卡记录 / 「我的」封面展示已贴的贴纸
export default function StickerDisplay({
  stickerIds,
  size = 'small',
  max = 3,
}: StickerDisplayProps) {
  if (!stickerIds || stickerIds.length === 0) return null;

  const displayIds = stickerIds.slice(0, max);
  const remaining = stickerIds.length - max;

  return (
    <View className={`sticker-display sticker-display--${size}`}>
      {displayIds.map((id) => {
        const sticker = getStickerById(id);
        if (!sticker) return null;
        return (
          <View
            key={id}
            className='sticker-display__item'
            dangerouslySetInnerHTML={{ __html: sticker.svg }}
          />
        );
      })}
      {remaining > 0 && (
        <View className='sticker-display__more'>
          +{remaining}
        </View>
      )}
    </View>
  );
}
