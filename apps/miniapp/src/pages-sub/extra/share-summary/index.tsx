import { View, Text } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { fetchYearSummary } from '../../../services/place';
import type { YearSummaryDto } from '@zuji/shared-types';
import './index.scss';

export default function ShareSummary() {
  const [summary, setSummary] = useState<YearSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  const year = parseInt(Taro.getCurrentInstance().router?.params?.year || '') || new Date().getFullYear();

  // 分享给好友
  Taro.useShareAppMessage(() => ({
    title: `我的 ${year} 年足迹总结`,
    path: `/pages-sub/extra/share-summary/index?year=${year}`,
  }));

  useEffect(() => {
    fetchYearSummary(year)
      .then(setSummary)
      .catch((e) => {
        console.error('加载年度总结失败:', e);
        Taro.showToast({ title: '加载失败', icon: 'error' });
      })
      .finally(() => setLoading(false));
  }, [year]);

  // 生成分享图（简化版：提示用户截图）
  const handleShare = () => {
    Taro.showToast({
      title: '截屏保存即可分享',
      icon: 'none',
      duration: 2000,
    });
  };

  if (loading) {
    return (
      <View className='summary'>
        <View className='summary__loading'><Text>生成中...</Text></View>
      </View>
    );
  }

  if (!summary) {
    return (
      <View className='summary'>
        <View className='summary__error'><Text>生成失败</Text></View>
      </View>
    );
  }

  const monthNames = ['一','二','三','四','五','六','七','八','九','十','十一','十二'];

  return (
    <View className='summary'>
      {/* 主卡片 */}
      <View className='summary__card'>
        {/* 顶部装饰 */}
        <View className='summary__decor'>
          <View className='summary__decor-circle summary__decor-circle--1' />
          <View className='summary__decor-circle summary__decor-circle--2' />
        </View>

        {/* 标题 */}
        <View className='summary__header'>
          <Text className='summary__year'>{year}</Text>
          <Text className='summary__title'>年度足迹</Text>
          <Text className='summary__subtitle'>我的生活地图</Text>
        </View>

        {/* 主数据 */}
        <View className='summary__main-stats'>
          <View className='summary__main-stat'>
            <Text className='summary__main-num'>{summary.placeCount}</Text>
            <Text className='summary__main-label'>收藏地点</Text>
          </View>
          <View className='summary__main-divider' />
          <View className='summary__main-stat'>
            <Text className='summary__main-num'>{summary.checkinCount}</Text>
            <Text className='summary__main-label'>打卡次数</Text>
          </View>
          <View className='summary__main-divider' />
          <View className='summary__main-stat'>
            <Text className='summary__main-num'>{summary.uniquePlaceCount}</Text>
            <Text className='summary__main-label'>走过地方</Text>
          </View>
        </View>

        {/* 亮点 */}
        {summary.routeCount > 0 && (
          <View className='summary__highlight'>
            <Text className='summary__highlight-icon'>✈️</Text>
            <Text className='summary__highlight-text'>
              记录了 {summary.routeCount} 条旅程
            </Text>
          </View>
        )}

        {summary.topMonth && (
          <View className='summary__highlight'>
            <Text className='summary__highlight-icon'>📅</Text>
            <Text className='summary__highlight-text'>
              {monthNames[summary.topMonth - 1]}月是最活跃的月份
            </Text>
          </View>
        )}

        {summary.topTag && (
          <View className='summary__highlight'>
            <Text className='summary__highlight-icon'>🏷️</Text>
            <Text className='summary__highlight-text'>
              最常去的是「{summary.topTag.name}」
            </Text>
          </View>
        )}

        {/* 底部品牌 */}
        <View className='summary__brand'>
          <Text className='summary__brand-name'>足迹手帐</Text>
          <Text className='summary__brand-slogan'>收藏每一次出发</Text>
        </View>
      </View>

      {/* 操作按钮 */}
      <View className='summary__actions'>
        <View className='summary__share-btn' onClick={handleShare}>
          <Text>截屏分享给朋友</Text>
        </View>
        <Text className='summary__hint'>长按或截屏保存图片</Text>
      </View>
    </View>
  );
}
