import { View, Text, Image } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { fetchCollections } from '../../services/collection';
import { resourceService } from '../../services/resource';
import ThemeImage from '../../components/ThemeImage';
import type { CollectionDto } from '@zuji/shared-types';
import './index.scss';

export default function Collections() {
  const [collections, setCollections] = useState<CollectionDto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await fetchCollections();
      setCollections(data);
    } catch (e) {
      console.error('加载合集失败:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  usePullDownRefresh(() => {
    loadCollections().finally(() => Taro.stopPullDownRefresh());
  });

  const handleCardClick = (collection: CollectionDto) => {
    Taro.navigateTo({ url: `/pages/collection-detail/index?id=${collection.id}` });
  };

  const handleCreate = () => {
    Taro.navigateTo({ url: '/pages/collection-create/index' });
  };

  if (loading && collections.length === 0) {
    return (
      <View className='collections'>
        <View className='collections__loading'><Text>加载中...</Text></View>
      </View>
    );
  }

  return (
    <View className='collections'>
      {/* 顶部标题栏 */}
      <View className='collections__header'>
        <Text className='collections__title'>我的合集</Text>
        <View className='collections__add' onClick={handleCreate}>
          <Text>+ 新建</Text>
        </View>
      </View>

      {/* 合集列表 */}
      {collections.length === 0 ? (
        <View className='collections__empty'>
          <Text className='collections__empty-icon'>📦</Text>
          <Text className='collections__empty-title'>还没有合集</Text>
          <Text className='collections__empty-sub'>把相关的地点打包成合集，方便分享给朋友</Text>
        </View>
      ) : (
        <View className='collections__list'>
          {collections.map((collection) => {
            const theme = resourceService.getThemeByName(collection.name);
            return (
              <View
                key={collection.id}
                className='collections__item'
                onClick={() => handleCardClick(collection)}
              >
                {/* 封面区 */}
                <View
                  className='collections__item-cover'
                  style={{ background: collection.coverImage ? '#fff' : theme.bg }}
                >
                  {collection.coverImage ? (
                    <Image className='collections__item-img' src={collection.coverImage} mode='aspectFill' />
                  ) : (
                    <View className='collections__item-emoji'>
                      <ThemeImage src={theme.illustUrl} emoji={theme.emoji} className='collections__item-emoji-img' mode='aspectFit' />
                    </View>
                  )}
                  <View className='collections__item-count'>
                    <Text>{collection.places.length} 个地点</Text>
                  </View>
                </View>
                {/* 信息区 */}
                <View className='collections__item-info'>
                  <Text className='collections__item-name'>{collection.name}</Text>
                  {collection.description && (
                    <Text className='collections__item-desc'>{collection.description}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
