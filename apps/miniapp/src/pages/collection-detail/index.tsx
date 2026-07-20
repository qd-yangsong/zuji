import { View, Text, Image, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { fetchCollectionDetail, deleteCollection, addPlaceToCollection } from '../../services/collection';
import { fetchPlaces } from '../../services/place';
import { resourceService } from '../../services/resource';
import ThemeShape from '../../components/ThemeShape';
import type { CollectionDto, PlaceDto } from '@zuji/shared-types';
import './index.scss';

export default function CollectionDetail() {
  const [collection, setCollection] = useState<CollectionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [allPlaces, setAllPlaces] = useState<PlaceDto[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

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

  // 从子页面返回时刷新合集详情
  useDidShow(() => {
    if (!id) return;
    fetchCollectionDetail(id)
      .then(setCollection)
      .catch(console.error);
  });

  const handlePlaceClick = (place: PlaceDto) => {
    Taro.navigateTo({ url: `/pages/place-detail/index?id=${place.id}` });
  };

  // 打开地点选择器
  const handleAddPlace = async () => {
    setShowPicker(true);
    setPickerLoading(true);
    try {
      const res = await fetchPlaces({ page: 1, pageSize: 100 });
      setAllPlaces(res.list);
    } catch (e) {
      console.error('加载地点列表失败:', e);
      Taro.showToast({ title: '加载地点失败', icon: 'none' });
    } finally {
      setPickerLoading(false);
    }
  };

  // 选择地点添加到合集
  const handleSelectPlace = async (placeId: string) => {
    if (!id || adding) return;
    setAdding(placeId);
    try {
      const updated = await addPlaceToCollection(id, placeId);
      setCollection(updated);
      Taro.showToast({ title: '添加成功', icon: 'success' });
      setShowPicker(false);
    } catch (e: any) {
      const msg = e?.message || '添加失败';
      Taro.showToast({ title: msg, icon: 'none' });
    } finally {
      setAdding(null);
    }
  };

  // 已在合集中的地点 ID 集合
  const existingIds = new Set(collection?.places.map((p) => p.id) || []);
  // 可添加的地点（排除已在合集中的）
  const availablePlaces = allPlaces.filter((p) => !existingIds.has(p.id));

  // 微信原生分享：定义分享卡片内容
  Taro.useShareAppMessage(() => {
    if (!collection) return { title: '足迹手帐' };
    return {
      title: `来看看这个合集：${collection.name}`,
      path: `/pages-sub/extra/share-place/index?collectionId=${collection.id}`,
    };
  });

  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    } as any);
    Taro.showToast({ title: '点击右上角分享给好友', icon: 'none' });
  };

  const handleDelete = () => {
    Taro.showModal({
      title: '确认删除',
      content: '删除合集不会删除其中的地点，但合集将无法恢复。确定吗？',
      success: async (r) => {
        if (r.confirm && collection) {
          try {
            await deleteCollection(collection.id);
            Taro.showToast({ title: '删除成功', icon: 'success' });
            setTimeout(() => Taro.navigateBack(), 1000);
          } catch (e) {
            console.error('删除合集失败:', e);
            Taro.showToast({ title: '删除失败', icon: 'error' });
          }
        }
      },
    });
  };

  const handleMore = () => {
    Taro.showActionSheet({
      itemList: ['删除合集'],
      success: (res) => {
        if (res.tapIndex === 0) {
          handleDelete();
        }
      },
    });
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
        <View className='collection-detail__edit' onClick={handleMore}>
          <Text>⋯</Text>
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

      {/* 底部按钮 */}
      <View className='collection-detail__footer'>
        <View className='collection-detail__add-btn' onClick={handleAddPlace}>
          <Text>添加地点</Text>
        </View>
        <View className='collection-detail__share-btn' onClick={handleShare}>
          <Text>分享合集</Text>
        </View>
      </View>

      {/* 地点选择弹窗 */}
      {showPicker && (
        <View className='collection-detail__mask' onClick={() => !adding && setShowPicker(false)}>
          <View className='collection-detail__picker' onClick={(e) => e.stopPropagation()}>
            <View className='collection-detail__picker-header'>
              <Text className='collection-detail__picker-title'>选择要添加的地点</Text>
              <Text
                className='collection-detail__picker-close'
                onClick={() => !adding && setShowPicker(false)}
              >✕</Text>
            </View>
            <ScrollView scrollY className='collection-detail__picker-list'>
              {pickerLoading ? (
                <View className='collection-detail__picker-empty'>
                  <Text>加载中...</Text>
                </View>
              ) : availablePlaces.length === 0 ? (
                <View className='collection-detail__picker-empty'>
                  <Text>没有可添加的地点了</Text>
                </View>
              ) : (
                availablePlaces.map((place) => {
                  const placeTheme = resourceService.getThemeByName(place.customName);
                  return (
                    <View
                      key={place.id}
                      className={`collection-detail__picker-item ${adding === place.id ? 'collection-detail__picker-item--disabled' : ''}`}
                      onClick={() => handleSelectPlace(place.id)}
                    >
                      <View
                        className='collection-detail__picker-badge'
                        style={{ background: placeTheme.gradient }}
                      >
                        <Text className='collection-detail__picker-badge-text'>
                          {place.customName.charAt(0)}
                        </Text>
                      </View>
                      <View className='collection-detail__picker-info'>
                        <Text className='collection-detail__picker-name'>{place.customName}</Text>
                        <Text className='collection-detail__picker-sub'>{place.realName}</Text>
                      </View>
                      <Text className='collection-detail__picker-add'>
                        {adding === place.id ? '添加中...' : '+'}
                      </Text>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}
