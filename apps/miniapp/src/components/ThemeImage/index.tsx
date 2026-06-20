/**
 * 主题图片组件
 *
 * 支持三种资源形式，按优先级自动降级：
 * 1. 远程图片 URL（illustUrl / decoUrl）
 * 2. 本地 require 图片路径
 * 3. emoji 占位（兜底）
 *
 * 后续把 emoji 替换为图片资源时，只需在 theme-config.ts 中填入 illustUrl，
 * 无需修改任何调用方代码。
 */
import { View, Text, Image } from '@tarojs/components';
import { useState, useEffect } from 'react';
import './index.scss';

interface ThemeImageProps {
  /** 图片 URL（远程或本地路径），为空时显示 emoji */
  src?: string;
  /** 降级 emoji */
  emoji: string;
  /** 自定义类名 */
  className?: string;
  /** 图片缩放模式 */
  mode?: 'aspectFill' | 'aspectFit' | 'widthFix';
}

export default function ThemeImage({
  src,
  emoji,
  className = '',
  mode = 'aspectFill',
}: ThemeImageProps) {
  const [loadFailed, setLoadFailed] = useState(false);

  // src 变化时重置加载状态
  useEffect(() => {
    setLoadFailed(false);
  }, [src]);

  // 无图片或加载失败，降级到 emoji
  if (!src || loadFailed) {
    return (
      <View className={`theme-image theme-image--fallback ${className}`}>
        <Text className='theme-image__emoji'>{emoji}</Text>
      </View>
    );
  }

  return (
    <Image
      className={`theme-image ${className}`}
      src={src}
      mode={mode}
      onError={() => setLoadFailed(true)}
    />
  );
}
