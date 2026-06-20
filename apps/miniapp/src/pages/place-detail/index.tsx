import { View, Text, Image, Map } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { fetchPlaceDetail } from '../../services/place';
import type { PlaceDto, TagDto, TagType } from '@zuji/shared-types';
import './index.scss';

// 格式化日期为 YYYY.MM.DD
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

// 按标签类型筛选
function filterTagsByType(tags: TagDto[], type: TagType): TagDto[] {
  return tags.filter((t) => t.type === type);
}

// 无封面时的占位色板
const PLACEHOLDER_COLORS = ['#54A0FF', '#48DBFB', '#FF6B6B', '#FFD93D', '#6BCB77', '#FF9F43'];

export default function PlaceDetail() {
  const [place, setPlace] = useState<PlaceDto | null>(null);
  const [loading, setLoading] = useState(true);

  // 从路由参数获取地点 ID
  const id = Taro.getCurrentInstance().router?.params?.id;

  useEffect(() => {
    if (!id) {
      Taro.showToast({ title: '参数错误', icon: 'none' });
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchPlaceDetail(id)
      .then(setPlace)
      .catch((e) => {
        console.error('加载详情失败:', e);
        Taro.showToast({ title: '加载失败', icon: 'error' });
      })
      .finally(() => setLoading(false));
  }, [id]);

  // 占位按钮回调
  const handleCheckin = () => {
    Taro.showToast({ title: '打卡功能即将上线', icon: 'none' });
  };

  const handleShare = () => {
    Taro.showToast({ title: '分享功能即将上线', icon: 'none' });
  };

  if (loading) {
    return (
      <View className='place-detail'>
        <View className='place-detail__loading'>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  if (!place) {
    return (
      <View className='place-detail'>
        <View className='place-detail__loading'>
          <Text>加载失败</Text>
        </View>
      </View>
    );
  }

  const attributeTags = filterTagsByType(place.tags, 'attribute');
  const sceneTags = filterTagsByType(place.tags, 'scene');
  const markers = [
    { id: 1, latitude: place.latitude, longitude: place.longitude, width: 30, height: 30 },
  ];
  // 根据昵称首字生成占位背景色
  const placeholderColor =
    PLACEHOLDER_COLORS[place.customName.charCodeAt(0) % PLACEHOLDER_COLORS.length];

  return (
    <View className='place-detail'>
      {/* 封面图（无封面用纯色占位） */}
      <View className='place-detail__cover'>
        {place.coverImage ? (
          <Image className='place-detail__cover-img' src={place.coverImage} mode='aspectFill' />
        ) : (
          <View
            className='place-detail__cover-placeholder'
            style={{ background: placeholderColor }}
          >
            <Text className='place-detail__cover-letter'>{place.customName.charAt(0)}</Text>
          </View>
        )}
      </View>

      {/* 信息卡片（圆角向上覆盖封面底部） */}
      <View className='place-detail__body'>
        <Text className='place-detail__custom-name'>{place.customName}</Text>
        <View className='place-detail__meta'>
          <Text className='place-detail__real-name'>{place.realName}</Text>
          {place.address && <Text className='place-detail__address'> · {place.address}</Text>}
        </View>

        {/* 统计信息 */}
        <Text className='place-detail__stats'>
          打卡 {place.checkinCount} 次 · 收藏于 {formatDate(place.collectedAt)}
        </Text>

        {/* 属性标签行 */}
        {attributeTags.length > 0 && (
          <View className='place-detail__tag-row'>
            <Text className='place-detail__tag-label'>属性</Text>
            <View className='place-detail__tags'>
              {attributeTags.map((tag) => (
                <Text key={tag.id} className='place-detail__tag place-detail__tag--attribute'>
                  {tag.name}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* 场景标签行 */}
        {sceneTags.length > 0 && (
          <View className='place-detail__tag-row'>
            <Text className='place-detail__tag-label'>场景</Text>
            <View className='place-detail__tags'>
              {sceneTags.map((tag) => (
                <Text key={tag.id} className='place-detail__tag place-detail__tag--scene'>
                  {tag.name}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* 小地图缩略（只读，显示该地点 marker） */}
        <View className='place-detail__map-wrapper'>
          <Map
            className='place-detail__map'
            latitude={place.latitude}
            longitude={place.longitude}
            markers={markers}
            scale={16}
          />
        </View>
      </View>

      {/* 底部操作按钮 */}
      <View className='place-detail__footer'>
        <View className='place-detail__btn' onClick={handleCheckin}>
          <Text>打卡</Text>
        </View>
        <View
          className='place-detail__btn place-detail__btn--outline'
          onClick={handleShare}
        >
          <Text>分享</Text>
        </View>
      </View>
    </View>
  );
}
