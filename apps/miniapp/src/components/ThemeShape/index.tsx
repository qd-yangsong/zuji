import { View } from '@tarojs/components';

interface ThemeShapeProps {
  geoType: 'night' | 'coffee' | 'park' | 'gather' | 'stay' | 'exhibit';
  className?: string;
}

/**
 * 主题几何图形组件
 * 纯 CSS 绘制，零图片依赖，永不失真。
 * 通过 geoType 匹配对应的 CSS 类名渲染图形。
 */
export default function ThemeShape({ geoType, className = '' }: ThemeShapeProps) {
  return <View className={`theme-shape theme-shape--${geoType} ${className}`} />;
}
