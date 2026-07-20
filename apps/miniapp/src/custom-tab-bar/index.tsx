import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import './index.scss';

const TABS = [
  { pagePath: '/pages/cards/index', text: '地点', index: 0 },
  { pagePath: '/pages/record/index', text: '记录', index: 1 },
  { pagePath: '/pages/journey/index', text: '旅程', index: 2 },
  { pagePath: '/pages/collections/index', text: '我的', index: 3 },
];

const routeMap: Record<string, number> = {};
TABS.forEach((t) => {
  routeMap[t.pagePath.replace(/^\//, '')] = t.index;
});

function routeToIndex(): number {
  try {
    const pages = Taro.getCurrentPages();
    if (pages.length === 0) return 0;
    const route = pages[pages.length - 1]?.route || '';
    return routeMap[route] ?? 0;
  } catch {
    return 0;
  }
}

export default function CustomTabBar() {
  const [selected, setSelected] = useState(() => routeToIndex());

  useEffect(() => {
    const timer = setInterval(() => {
      const current = routeToIndex();
      setSelected((prev) => (prev !== current ? current : prev));
    }, 300);
    return () => clearInterval(timer);
  }, []);

  const switchTab = (index: number) => {
    setSelected(index);
    Taro.switchTab({
      url: TABS[index].pagePath,
      fail: () => {
        setSelected(routeToIndex());
      },
    });
  };

  return (
    <View className='tab-bar'>
      <View className='tab-bar__content'>
        {TABS.map((tab, index) => {
          const isActive = selected === index;
          return (
            <View
              key={tab.pagePath}
              className={`tab-bar__item ${isActive ? 'tab-bar__item--active' : ''}`}
              onClick={() => switchTab(index)}
            >
              <View className='tab-bar__icon'>
                {index === 0 && <View className='tab-bar__icon-place' />}
                {index === 1 && <View className='tab-bar__icon-record' />}
                {index === 2 && <View className='tab-bar__icon-journey' />}
                {index === 3 && <View className='tab-bar__icon-my' />}
              </View>
              <Text className='tab-bar__text'>{tab.text}</Text>
            </View>
          );
        })}
      </View>
      <View className='tab-bar__safe' />
    </View>
  );
}
