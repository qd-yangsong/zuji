import { View, Text, Image } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { fetchCollectionDetail } from '../../services/collection';
import { resourceService } from '../../services/resource';
import ThemeShape from '../../components/ThemeShape';
import type { CollectionDto, PlaceDto } from '@zuji/shared-types';
import './index.scss';

export default function CollectionDetail() {
  const [collection, setCollection] = useState<CollectionDto | null>(null);
  const [loading, setLoading] = useState(true);

  const id = Taro.getCurrentInstance().router?.params?.id;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchCollectionDetail(id)
      .then(setCollection)
      .catch((e) => {
        console.error('加载合集详情失败:', e);
        Taro.showToast({ title: '加载失败', icon: 'error' });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePlaceClick = (place: PlaceDto) => {
    Taro.navigateTo({ url: `/pages/place-detail/index?id=${place.id}` });
  };

  // 微信原生分享：定义分享卡片内容
  Taro.useShareAppMessage(() => {
    if (!collection) return { title: '足迹手帐' };
    return {
      title: `来看看这个合集：${collection.name}`,
      path: `/pages/share-place/index?collectionId=${collection.id}`,
    };
  });

  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });
    Taro.showToast({ title: '点击右上角分享给好友', icon: 'none' });
  };

  const handleEdit = () => {
    Taro.showToast({ title: '编辑功能即将上线', icon: 'none' });
  };

  if (loading) {
    return (
      <View className='collection-detail'>
        <View className='collection-detail__loading'><Text>加载中...</Text></View>
      </View>
    );
  }

  if (!collection) {
    return (
      <View className='collection-detail'>
        <View className='collection-detail__loading'><Text>加载失败</Text></View>
      </View>
    );
  }

  const theme = resourceService.getThemeByName(collection.name);

  return (
    <View className='collection-detail'>
      {/* 封面区 */}
      <View
        className='collection-detail__cover'
        style={{ background: collection.coverImage ? '#fff' : theme.gradient }}
      >
        {collection.coverImage ? (
          <Image className='collection-detail__cover-img' src={collection.coverImage} mode='aspectFill' />
        ) : (
          <View className='collection-detail__cover-emoji'>
            <ThemeShape geoType={theme.geoType} className='collection-detail__cover-emoji-img' />
          </View>
        )}
        <View className='collection-detail__edit' onClick={handleEdit}>
          <Text>编辑</Text>
        </View>
      </View>

      {/* 信息卡片 */}
      <View className='collection-detail__body'>
        <Text className='collection-detail__name'>{collection.name}</Text>
        {collection.description && (
          <Text className='collection-detail__desc'>{collection.description}</Text>
        )}
        <View className='collection-detail__stats'>
          <Text className='collection-detail__stat'>{collection.places.length} 个地点</Text>
        </View>

        {/* 地点列表 */}
        {collection.places.length === 0 ? (
          <View className='collection-detail__empty'>
            <Text className='collection-detail__empty-text'>还没有添加地点</Text>
          </View>
        ) : (
          <View className='collection-detail__list'>
            {collection.places.map((place, idx) => {
              const placeTheme = resourceService.getThemeByName(place.customName);
              return (
                <View
                  key={place.id}
                  className='collection-detail__place-item'
                  onClick={() => handlePlaceClick(place)}
                >
                  <View
                    className='collection-detail__place-badge'
                    style={{ background: '#fff' }}
                  >
                    <Text style={{ color: placeTheme.accent }}>{idx + 1}</Text>
                  </View>
                  <View className='collection-detail__place-info'>
                    <Text className='collection-detail__place-name'>{place.customName}</Text>
                    <Text className='collection-detail__place-sub'>{place.realName}</Text>
                    {place.checkinCount > 0 && (
                      <Text className='collection-detail__place-checkin'>打卡 {place.checkinCount} 次</Text>
                    )}
                  </View>
                  <Text className='collection-detail__place-arrow'>›</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* 底部分享按钮 */}
      <View className='collection-detail__footer'>
        <View className='collection-detail__share-btn' onClick={handleShare}>
          <Text>分享合集</Text>
        </View>
      </View>
    </View>
  );
}
