import { View, Text } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { findNearbyPlaces, fetchPlaces } from '../../services/place';
import './index.scss';

interface NearbyPlace {
  placeId: string;
  customName: string;
  realName: string;
  distance: number;
  checkinCount: number;
  lastCheckinAt: string | null;
}

export default function RecordPage() {
  const [locStatus, setLocStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  // 附近匹配的地点
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  // 最近收藏的地点（快速记录兜底）
  const [recentPlaces, setRecentPlaces] = useState<any[]>([]);

  // 定位 + 匹配
  const locateAndMatch = async () => {
    setLocStatus('loading');
    try {
      const res = await Taro.getLocation({ type: 'gcj02' });
      setLatitude(res.latitude);
      setLongitude(res.longitude);
      setLocStatus('success');

      // 查找附近已收藏地点
      const nearby = await findNearbyPlaces(res.latitude, res.longitude, 100);
      setNearbyPlaces(nearby);

      // 同时拉最近收藏（作为快速记录兜底）
      if (nearby.length === 0) {
        const { list } = await fetchPlaces({ page: 1, pageSize: 5 });
        setRecentPlaces(list);
      }
    } catch (e: any) {
      console.error('定位失败:', e);
      setLocStatus('failed');
      // 定位失败时拉取最近收藏作为兜底
      try {
        const { list } = await fetchPlaces({ page: 1, pageSize: 5 });
        setRecentPlaces(list);
      } catch {}
    }
  };

  // 页面显示时自动定位
  useEffect(() => { locateAndMatch(); }, []);

  // 从其他页面返回时刷新
  useDidShow(() => {
    if (locStatus === 'success') {
      findNearbyPlaces(latitude, longitude, 100).then(setNearbyPlaces);
    }
  });

  // 点击附近地点 → 跳转打卡
  const handleRecordPlace = (place: NearbyPlace) => {
    Taro.navigateTo({
      url: `/pages/checkin/index?placeId=${place.placeId}&from=record`,
    });
  };

  // 点击最近地点 → 跳转打卡
  const handleRecentRecord = (placeId: string) => {
    Taro.navigateTo({
      url: `/pages/checkin/index?placeId=${placeId}&from=record`,
    });
  };

  // 创建新地点
  const handleNewPlace = () => {
    Taro.navigateTo({ url: '/pages/place-create/index' });
  };

  // 主题色哈希分配函数（与 cards 页保持一致）
  const getThemeIndex = (name: string): number => {
    if (!name) return 0;
    return name.charCodeAt(0) % 6;
  };

  const themeGradients = [
    'linear-gradient(135deg, #FF9A9E, #FAD0C4)',
    'linear-gradient(135deg, #A8E6CF, #DCEDC1)',
    'linear-gradient(135deg, #89CFF0, #B5EAD7)',
    'linear-gradient(135deg, #FFD3A5, #FD6585)',
    'linear-gradient(135deg, #C9B1FF, #FFACE0)',
    'linear-gradient(135deg, #F8E2A6, #F4A460)',
  ];

  const isNearbyEmpty = nearbyPlaces.length === 0;
  const isRecentEmpty = recentPlaces.length === 0;

  return (
    <View className='record'>
      {/* 顶部定位状态 */}
      <View className='record__header'>
        {locStatus === 'loading' && (
          <View className='record__locating'>
            <View className='record__loc-spinner' />
            <Text className='record__loc-text'>正在定位...</Text>
          </View>
        )}
        {locStatus === 'failed' && (
          <View>
            <Text className='record__loc-failed'>定位失败</Text>
            <View className='record__retry-btn' onClick={locateAndMatch}>
              <Text>重新定位</Text>
            </View>
          </View>
        )}
        {locStatus === 'success' && nearbyPlaces.length > 0 && (
          <Text className='record__loc-text'>
            在 100 米内找到 {nearbyPlaces.length} 个收藏地点
          </Text>
        )}
      </View>

      {/* 附近匹配 */}
      {locStatus === 'success' && !isNearbyEmpty && (
        <View className='record__matched'>
          <Text className='record__matched-title'>你是不是在这些地方？</Text>
          <View className='record__matched-list'>
            {nearbyPlaces.map((place) => (
              <View
                key={place.placeId}
                className='record__place-card'
                onClick={() => handleRecordPlace(place)}
              >
                <View
                  className='record__place-avatar'
                  style={{ background: themeGradients[getThemeIndex(place.customName || place.realName)] }}
                >
                  <Text>{(place.customName || place.realName).charAt(0)}</Text>
                </View>
                <View className='record__place-info'>
                  <Text className='record__place-name'>{place.customName || place.realName}</Text>
                  <Text className='record__place-meta'>
                    约 {place.distance} 米 · 打卡 {place.checkinCount} 次
                  </Text>
                </View>
                <Text className='record__place-arrow'>&gt;</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 无匹配 → 显示最近收藏 + 创建新地点选项 */}
      {locStatus === 'success' && isNearbyEmpty && (
        <View className='record__no-match'>
          <Text className='record__no-match-text'>附近没有已收藏的地点</Text>
          <View className='record__new-btn' onClick={handleNewPlace}>
            <Text>+ 收藏当前位置</Text>
          </View>
        </View>
      )}

      {/* 快速记录：最近收藏的地点 */}
      {!isRecentEmpty && (
        <View className='record__quick'>
          <Text className='record__quick-title'>最近收藏</Text>
          <View className='record__quick-list'>
            {recentPlaces.map((place) => (
              <View
                key={place.id}
                className='record__quick-item'
                onClick={() => handleRecentRecord(place.id)}
              >
                <View
                  className='record__quick-avatar'
                  style={{ background: themeGradients[getThemeIndex(place.customName || place.realName)] }}
                />
                <View className='record__quick-info'>
                  <Text className='record__quick-name'>{place.customName || place.realName}</Text>
                  <Text className='record__quick-time'>打卡 {place.checkinCount} 次</Text>
                </View>
                <View className='record__quick-action'>
                  <Text>记录</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 空状态：新用户没有任何地点 */}
      {locStatus !== 'loading' && isNearbyEmpty && isRecentEmpty && (
        <View className='record__empty'>
          <Text className='record__empty-icon'>📔</Text>
          <Text className='record__empty-title'>开始写你的手帐吧</Text>
          <Text className='record__empty-desc'>
            收藏去过的地点，记录感受{'\n'}每次打开都能快速记录
          </Text>
          <View style={{ marginTop: '32rpx' }}>
            <View className='record__new-btn' onClick={handleNewPlace}>
              <Text>收藏第一个地点</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
