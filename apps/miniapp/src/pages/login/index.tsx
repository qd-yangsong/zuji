import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useMemo } from 'react';
import './index.scss';

/**
 * 星夜足迹 — 登录扉页
 * 暗色系 + 星光粒子 + 发光足迹 Logo + 毛玻璃卡片
 */

// 预生成的星光粒子位置（固定种子，避免每次渲染变化）
const STAR_SEED = [
  { x: 8, y: 12, s: 0.6, d: 0.8, delay: 0 },
  { x: 18, y: 8, s: 1.0, d: 1.2, delay: 0.3 },
  { x: 32, y: 5, s: 0.4, d: 0.6, delay: 0.7 },
  { x: 48, y: 14, s: 0.8, d: 1.0, delay: 0.2 },
  { x: 62, y: 6, s: 0.5, d: 0.7, delay: 0.9 },
  { x: 78, y: 10, s: 0.7, d: 0.9, delay: 0.4 },
  { x: 88, y: 18, s: 0.3, d: 0.5, delay: 1.1 },
  { x: 14, y: 28, s: 0.5, d: 0.8, delay: 0.6 },
  { x: 42, y: 22, s: 0.9, d: 1.1, delay: 0.1 },
  { x: 68, y: 26, s: 0.6, d: 0.7, delay: 0.8 },
  { x: 82, y: 30, s: 0.4, d: 0.6, delay: 0.5 },
  { x: 10, y: 44, s: 0.7, d: 0.9, delay: 0.3 },
  { x: 26, y: 38, s: 0.3, d: 0.5, delay: 1.0 },
  { x: 56, y: 34, s: 1.0, d: 1.3, delay: 0.2 },
  { x: 74, y: 42, s: 0.5, d: 0.7, delay: 0.7 },
  { x: 90, y: 36, s: 0.6, d: 0.8, delay: 0.4 },
  { x: 20, y: 56, s: 0.4, d: 0.5, delay: 0.9 },
  { x: 38, y: 50, s: 0.8, d: 1.0, delay: 0.1 },
  { x: 60, y: 54, s: 0.5, d: 0.6, delay: 0.6 },
  { x: 80, y: 58, s: 0.7, d: 0.9, delay: 0.3 },
  { x: 50, y: 68, s: 0.4, d: 0.5, delay: 1.2 },
  { x: 70, y: 70, s: 0.6, d: 0.8, delay: 0.5 },
  { x: 30, y: 72, s: 0.5, d: 0.6, delay: 0.8 },
  { x: 88, y: 66, s: 0.3, d: 0.4, delay: 1.0 },
  { x: 44, y: 80, s: 0.7, d: 0.9, delay: 0.2 },
];

export default function Login() {
  const [entering, setEntering] = useState(false);

  const stars = useMemo(() => STAR_SEED, []);

  const handleEnter = () => {
    if (entering) return;
    setEntering(true);
    Taro.switchTab({ url: '/pages/cards/index' });
  };

  const handleAgreement = () => {
    Taro.navigateTo({ url: '/pages-sub/static/agreement/index' });
  };

  const handlePrivacy = () => {
    Taro.navigateTo({ url: '/pages-sub/static/privacy/index' });
  };

  return (
    <View className='login'>
      {/* 星光粒子层 */}
      <View className='login__stars'>
        {stars.map((s, i) => (
          <View
            key={i}
            className='login__star'
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${4 + s.s * 4}px`,
              height: `${4 + s.s * 4}px`,
              animationDuration: `${1.5 + s.d * 1.5}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </View>

      {/* 指纹星座连线（装饰） */}
      <View className='login__constellation'>
        <View className='login__constellation-line login__constellation-line--1' />
        <View className='login__constellation-line login__constellation-line--2' />
        <View className='login__constellation-line login__constellation-line--3' />
      </View>

      {/* 发光足迹 Logo */}
      <View className='login__logo-area'>
        <View className='login__footprint'>
          {/* 脚掌主体 */}
          <View className='login__footprint-sole' />
          {/* 5 个脚趾 */}
          <View className='login__footprint-toe login__footprint-toe--1' />
          <View className='login__footprint-toe login__footprint-toe--2' />
          <View className='login__footprint-toe login__footprint-toe--3' />
          <View className='login__footprint-toe login__footprint-toe--4' />
          <View className='login__footprint-toe login__footprint-toe--5' />
          {/* 光晕层 */}
          <View className='login__footprint-glow' />
        </View>
      </View>

      {/* 底部毛玻璃卡片 */}
      <View className='login__card'>
        <Text className='login__title'>足迹手帐</Text>
        <Text className='login__subtitle'>收藏每一次出发</Text>

        <Button
          className='login__btn'
          onClick={handleEnter}
          disabled={entering}
        >
          <View className='login__btn-icon'>
            {/* 星轨十字图标 */}
            <View className='login__btn-cross-h' />
            <View className='login__btn-cross-v' />
            <View className='login__btn-dot' />
            <View className='login__btn-arc' />
            <View className='login__btn-arc login__btn-arc--2' />
          </View>
          <Text className='login__btn-text'>
            {entering ? '正在开启...' : '开启我的手帐'}
          </Text>
        </Button>

        <View className='login__agreement'>
          <Text className='login__agreement-text'>登录即表示同意</Text>
          <Text className='login__agreement-link' onClick={handleAgreement}>
            《用户协议》
          </Text>
          <Text className='login__agreement-text'>和</Text>
          <Text className='login__agreement-link' onClick={handlePrivacy}>
            《隐私政策》
          </Text>
        </View>
      </View>
    </View>
  );
}
