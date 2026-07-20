import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

/**
 * 使用指南页面
 * 图文卡片式布局，介绍各功能模块的使用方法
 */
export default function GuidePage() {
  const guides = [
    {
      icon: '📍',
      title: '收藏地点',
      color: '#6366f1',
      bg: '#eef2ff',
      desc: '在「地点」页面点击右下角的 + 号，选择位置并填写信息，即可收藏一个地点。支持自动定位或搜索地点名称。',
    },
    {
      icon: '✅',
      title: '打卡记录',
      color: '#10b981',
      bg: '#ecfdf5',
      desc: '进入地点详情页，点击「打卡」按钮，写下你的心情、附上照片，记录每一次到访。',
    },
    {
      icon: '🗺️',
      title: '旅程地图',
      color: '#f59e0b',
      bg: '#fffbeb',
      desc: '在「发现」页面，所有已收藏的地点会在地图上标记，直观展示你的足迹分布。',
    },
    {
      icon: '📂',
      title: '合集管理',
      color: '#ec4899',
      bg: '#fdf2f8',
      desc: '在「我的」页面创建合集，把相关的地点打包在一起，比如「周末探店」「旅行回忆」，方便集中查看和分享。',
    },
    {
      icon: '📤',
      title: '分享地点',
      color: '#3b82f6',
      bg: '#eff6ff',
      desc: '在地点详情页点击右上角分享按钮，可以把单个地点分享给微信好友，对方无需登录即可查看。',
    },
    {
      icon: '🏆',
      title: '成就体系',
      color: '#8b5cf6',
      bg: '#f5f3ff',
      desc: '收藏更多地点解锁成就徽章：初识（3个）、足迹（5个）、漫游者（10个），持续探索解锁更多。',
    },
  ];

  const handleFeedback = () => {
    Taro.navigateTo({ url: '/pages-sub/extra/feedback/index' });
  };

  return (
    <View className='guide'>
      {/* 顶部标题 */}
      <View className='guide__header'>
        <Text className='guide__header-title'>使用指南</Text>
        <Text className='guide__header-sub'>了解足迹手帐的全部功能</Text>
      </View>

      {/* 功能卡片列表 */}
      <View className='guide__list'>
        {guides.map((item, idx) => (
          <View key={idx} className='guide__card'>
            <View className='guide__card-header'>
              <View
                className='guide__card-icon-wrap'
                style={{ background: item.bg }}
              >
                <Text className='guide__card-icon'>{item.icon}</Text>
              </View>
              <View className='guide__card-title-wrap'>
                <Text className='guide__card-num'>0{idx + 1}</Text>
                <Text className='guide__card-title' style={{ color: item.color }}>
                  {item.title}
                </Text>
              </View>
            </View>
            <Text className='guide__card-desc'>{item.desc}</Text>
          </View>
        ))}
      </View>

      {/* 底部反馈入口 */}
      <View className='guide__footer' onClick={handleFeedback}>
        <Text className='guide__footer-text'>还有疑问？给我们反馈</Text>
        <Text className='guide__footer-arrow'>›</Text>
      </View>
    </View>
  );
}
