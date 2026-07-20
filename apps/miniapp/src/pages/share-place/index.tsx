import { View, Text, Map } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { fetchSharedPlace } from '../../services/share';
import { resourceService } from '../../services/resource';
import type { PlaceDto, TagDto, TagType } from '@zuji/shared-types';
import './index.scss';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function filterTagsByType(tags: TagDto[], type: TagType): TagDto[] {
  return tags.filter((t) => t.type === type);
}

// 微信小程序 onShareAppMessage 钩子：允许好友再次转发
function useShare(place: PlaceDto | null) {
  Taro.useShareAppMessage(() => {
    if (!place) return { title: '足迹手帐' };
    return {
      title: `来看看这个地点：${place.customName}`,
      path: `/pages/share-place/index?id=${place.id}`,
    };
  });
}

export default function SharePlace() {
  const [place, setPlace] = useState<PlaceDto | null>(null);
  const [loading, setLoading] = useState(true);

  const id = Taro.getCurrentInstance().router?.params?.id;

  useShare(place);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchSharedPlace(id)
      .then(setPlace)
      .catch((e) => {
        console.error('加载分享地点失败:', e);
        Taro.showToast({ title: '加载失败', icon: 'error' });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleNavigate = () => {
    if (!place) return;
    Taro.openLocation({
      latitude: place.latitude,
      longitude: place.longitude,
      name: place.customName,
      address: place.address || place.realName,
    }).catch(() => {
      Taro.showToast({ title: '打开地图失败', icon: 'error' });
    });
  };

  if (loading) {
    return (
      <View className='share-place'>
        <View className='share-place__loading'><Text>加载中...</Text></View>
      </View>
    );
  }

  if (!place) {
    return (
      <View className='share-place'>
        <View className='share-place__error'>
          <Text>📍 地点不存在或已被删除</Text>
        </View>
      </View>
    );
  }

  const theme = resourceService.getThemeByName(place.customName);
  const attributeTags = filterTagsByType(place.tags, 'attribute');
  const sceneTags = filterTagsByType(place.tags, 'scene');

  return (
    <View className='share-place'>
      {/* 封面区 */}
      <View className='share-place__cover' style={{ background: theme.gradient }}>
        <View className='share-place__cover-badge' style={{ background: theme.accent }}>
          <Text style={{ color: '#fff' }}>{place?.customName?.charAt(0) || '?'}</Text>
        </View>
      </View>

      {/* 信息卡片 */}
      <View className='share-place__body'>
        <Text className='share-place__name'>{place.customName}</Text>
        <View className='share-place__meta'>
          <Text className='share-place__pin'>📍</Text>
          <Text className='share-place__real-name'>{place.realName}</Text>
          {place.address && <Text className='share-place__address'> · {place.address}</Text>}
        </View>

        {/* 标签 */}
        {(attributeTags.length > 0 || sceneTags.length > 0) && (
          <View className='share-place__tags'>
            {attributeTags.map((tag) => (
              <Text key={tag.id} className='share-place__tag share-place__tag--attr'>{tag.name}</Text>
            ))}
            {sceneTags.map((tag) => (
              <Text key={tag.id} className='share-place__tag share-place__tag--scene'>适合{tag.name}</Text>
            ))}
          </View>
        )}

        {/* 统计 */}
        <View className='share-place__stats'>
          <Text>★ 打卡 {place.checkinCount} 次 · 收藏于 {formatDate(place.collectedAt)}</Text>
        </View>

        {/* 小地图 */}
        <Map
          className='share-place__map'
          latitude={place.latitude}
          longitude={place.longitude}
          markers={[{ id: 1, latitude: place.latitude, longitude: place.longitude, width: 30, height: 30, iconPath: '' }]}
          scale={16}
          onError={() => {}}
        />

        {/* 提示文案 */}
        <Text className='share-place__tip'>
          想记录对你重要的地点？搜索「足迹手帐」开始使用
        </Text>
      </View>

      {/* 底部导航按钮 */}
      <View className='share-place__footer'>
        <View className='share-place__nav-btn' onClick={handleNavigate}>
          <Text>🧭 导航到这里</Text>
        </View>
      </View>
    </View>
  );
}
