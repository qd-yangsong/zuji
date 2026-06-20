import { View, Text, Map } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { fetchJourneyMap } from '../../services/collection';
import type { JourneyMarkerDto } from '@zuji/shared-types';
import './index.scss';

export default function Journey() {
  const [markers, setMarkers] = useState<JourneyMarkerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<JourneyMarkerDto | null>(null);

  useEffect(() => {
    fetchJourneyMap()
      .then(setMarkers)
      .catch((e) => {
        console.error('加载旅程地图失败:', e);
        Taro.showToast({ title: '加载失败', icon: 'error' });
      })
      .finally(() => setLoading(false));
  }, []);

  // 转换为 Taro Map markers 格式
  const mapMarkers = markers.map((m, idx) => ({
    id: idx,
    latitude: m.latitude,
    longitude: m.longitude,
    width: 32,
    height: 32,
    callout: {
      content: m.customName,
      color: '#333',
      fontSize: 12,
      borderRadius: 8,
      padding: 6,
      display: 'BYCLICK',
    },
  }));

  const handleMarkerTap = (e: any) => {
    const idx = e.detail.markerId;
    setSelected(markers[idx]);
  };

  const handleCardClick = () => {
    if (selected) {
      Taro.navigateTo({ url: `/pages/place-detail/index?id=${selected.placeId}` });
    }
  };

  const totalCheckins = markers.reduce((sum, m) => sum + m.checkinCount, 0);

  if (loading) {
    return (
      <View className='journey'>
        <View className='journey__loading'><Text>加载中...</Text></View>
      </View>
    );
  }

  if (markers.length === 0) {
    return (
      <View className='journey'>
        <View className='journey__empty'>
          <Text className='journey__empty-icon'>🗺️</Text>
          <Text className='journey__empty-title'>还没有打卡记录</Text>
          <Text className='journey__empty-sub'>去标记地点并打卡，绘制你的旅程地图吧</Text>
        </View>
      </View>
    );
  }

  // 计算地图中心点（取第一个标记点）
  const center = markers[0];

  return (
    <View className='journey'>
      {/* 顶部统计栏 */}
      <View className='journey__stats'>
        <View className='journey__stat'>
          <Text className='journey__stat-num'>{markers.length}</Text>
          <Text className='journey__stat-label'>个地点</Text>
        </View>
        <View className='journey__stat-divider' />
        <View className='journey__stat'>
          <Text className='journey__stat-num'>{totalCheckins}</Text>
          <Text className='journey__stat-label'>次打卡</Text>
        </View>
      </View>

      {/* 全屏地图 */}
      <Map
        className='journey__map'
        latitude={center.latitude}
        longitude={center.longitude}
        markers={mapMarkers}
        scale={12}
        onMarkerTap={handleMarkerTap}
      />

      {/* 底部信息卡片 */}
      {selected && (
        <View className='journey__card' onClick={handleCardClick}>
          <View className='journey__card-header'>
            <Text className='journey__card-name'>{selected.customName}</Text>
            <Text className='journey__card-arrow'>›</Text>
          </View>
          <Text className='journey__card-sub'>{selected.realName}</Text>
          <View className='journey__card-meta'>
            <Text className='journey__card-checkin'>打卡 {selected.checkinCount} 次</Text>
            {selected.lastCheckinAt && (
              <Text className='journey__card-last'>
                最近：{new Date(selected.lastCheckinAt).toLocaleDateString('zh-CN')}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
