import { View, Text, Image } from '@tarojs/components';
import { useState, useEffect, useRef } from 'react';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import { fetchRoutes } from '../../services/route';
import { fetchPlaces } from '../../services/place';
import { useUserStore } from '../../stores/userStore';
import { resourceService } from '../../services/resource';
import ThemeShape from '../../components/ThemeShape';
import type { RouteDto, PlaceDto } from '@zuji/shared-types';
import './index.scss';

export default function MyPage() {
  const { user } = useUserStore();
  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [placeCount, setPlaceCount] = useState(0);
  const [checkinCount, setCheckinCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const isFirstLoad = useRef(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [routesData, placesData] = await Promise.all([
        fetchRoutes(),
        fetchPlaces({ page: 1, pageSize: 1 }),
      ]);
      setRoutes(routesData);
      setPlaceCount(placesData.total);
      // 统计打卡总数
      const allPlaces = await fetchPlaces({ page: 1, pageSize: 100 });
      setCheckinCount(allPlaces.list.reduce((sum, p) => sum + p.checkinCount, 0));
    } catch (e) {
      console.error('加载数据失败:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    isFirstLoad.current = false;
  }, []);

  useDidShow(() => {
    if (!isFirstLoad.current) loadData();
  });

  usePullDownRefresh(() => {
    loadData().finally(() => Taro.stopPullDownRefresh());
  });

  const handleRouteClick = (route: RouteDto) => {
    // 路线详情页复用 collection-detail，后续可独立
    Taro.navigateTo({ url: `/pages/collection-detail/index?id=${route.id}&type=route` });
  };

  const handleCreateRoute = () => {
    Taro.navigateTo({ url: '/pages/collection-create/index?type=route' });
  };

  const handleGuide = () => {
    Taro.navigateTo({ url: '/pages-sub/static/guide/index' });
  };

  const handleFeedback = () => {
    Taro.navigateTo({ url: '/pages-sub/extra/feedback/index' });
  };

  // 查看年度总结
  const handleYearSummary = () => {
    const year = new Date().getFullYear();
    Taro.navigateTo({ url: `/pages-sub/extra/share-summary/index?year=${year}` });
  };

  // 分离合集和旅程
  const collections = routes.filter(r => r.type === 'collection');
  const journeys = routes.filter(r => r.type === 'journey');

  if (loading && routes.length === 0) {
    return (
      <View className='my'>
        <View className='my__loading'><Text>加载中...</Text></View>
      </View>
    );
  }

  return (
    <View className='my'>
      {/* 手帐本封面区 */}
      <View className='my__cover'>
        <View className='my__cover-avatar'>
          {user?.avatarUrl ? (
            <Image className='my__cover-avatar-img' src={user.avatarUrl} mode='aspectFill' />
          ) : (
            <View className='my__cover-avatar-placeholder'>
              <Text>{(user?.nickname || '我').charAt(0)}</Text>
            </View>
          )}
        </View>
        <Text className='my__cover-name'>{user?.nickname || '我的手帐'}</Text>
        <Text className='my__cover-signature'>
          {user?.signature || '收藏每一次出发'}
        </Text>

        {/* 统计数据 */}
        <View className='my__stats'>
          <View className='my__stat'>
            <Text className='my__stat-num'>{placeCount}</Text>
            <Text className='my__stat-label'>地点</Text>
          </View>
          <View className='my__stat-divider' />
          <View className='my__stat'>
            <Text className='my__stat-num'>{checkinCount}</Text>
            <Text className='my__stat-label'>打卡</Text>
          </View>
          <View className='my__stat-divider' />
          <View className='my__stat'>
            <Text className='my__stat-num'>{routes.length}</Text>
            <Text className='my__stat-label'>路线</Text>
          </View>
        </View>
      </View>

      {/* 功能入口 */}
      <View className='my__menu'>
        <View className='my__menu-item my__menu-item--highlight' onClick={handleYearSummary}>
          <View className='my__menu-icon my__menu-icon--summary'>
            <Text className='my__menu-emoji'>📊</Text>
          </View>
          <View className='my__menu-text'>
            <Text className='my__menu-title'>{new Date().getFullYear()} 年度足迹</Text>
            <Text className='my__menu-desc'>查看你的年度总结，分享给朋友</Text>
          </View>
          <Text className='my__menu-arrow'>›</Text>
        </View>
        <View className='my__menu-item' onClick={handleGuide}>
          <View className='my__menu-icon my__menu-icon--guide'>
            <Text className='my__menu-emoji'>📖</Text>
          </View>
          <View className='my__menu-text'>
            <Text className='my__menu-title'>使用指南</Text>
            <Text className='my__menu-desc'>了解足迹手帐的全部功能</Text>
          </View>
          <Text className='my__menu-arrow'>›</Text>
        </View>
        <View className='my__menu-item' onClick={handleFeedback}>
          <View className='my__menu-icon my__menu-icon--feedback'>
            <Text className='my__menu-emoji'>💬</Text>
          </View>
          <View className='my__menu-text'>
            <Text className='my__menu-title'>意见反馈</Text>
            <Text className='my__menu-desc'>帮助我们把产品做得更好</Text>
          </View>
          <Text className='my__menu-arrow'>›</Text>
        </View>
      </View>

      {/* 旅程列表 */}
      {journeys.length > 0 && (
        <View className='my__section'>
          <View className='my__section-header'>
            <Text className='my__section-title'>✈️ 我的旅程</Text>
            <View className='my__add-btn' onClick={handleCreateRoute}>
              <Text>+ 新建</Text>
            </View>
          </View>
          <View className='my__route-list'>
            {journeys.map((journey) => {
              const theme = resourceService.getThemeByName(journey.name);
              return (
                <View
                  key={journey.id}
                  className='my__route-item my__route-item--journey'
                  onClick={() => handleRouteClick(journey)}
                >
                  <View
                    className='my__route-cover'
                    style={{ background: journey.coverImage ? '#fff' : theme.gradient }}
                  >
                    {journey.coverImage ? (
                      <Image className='my__route-img' src={journey.coverImage} mode='aspectFill' />
                    ) : (
                      <ThemeShape geoType={theme.geoType} />
                    )}
                    {journey.status === 'completed' && (
                      <View className='my__route-badge'>
                        <Text>已完成</Text>
                      </View>
                    )}
                  </View>
                  <View className='my__route-info'>
                    <Text className='my__route-name'>{journey.name}</Text>
                    <Text className='my__route-meta'>
                      {journey.places.length} 个地点
                      {journey.startDate && ` · ${new Date(journey.startDate).toLocaleDateString('zh-CN')}`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* 合集列表 */}
      <View className='my__section'>
        <View className='my__section-header'>
          <Text className='my__section-title'>
            {journeys.length > 0 ? '📚 地点合集' : '📚 我的合集'}
          </Text>
          {journeys.length === 0 && (
            <View className='my__add-btn' onClick={handleCreateRoute}>
              <Text>+ 新建</Text>
            </View>
          )}
        </View>

        {routes.length === 0 ? (
          <View className='my__empty'>
            <View className='my__empty-circle' />
            <Text className='my__empty-title'>还没有路线或合集</Text>
            <Text className='my__empty-sub'>
              创建一条旅行路线，记录你的旅程{'\n'}或把相关地点打包成合集
            </Text>
            <View className='my__empty-btn' onClick={handleCreateRoute}>
              <Text>创建第一条路线</Text>
            </View>
          </View>
        ) : (
          <View className='my__route-list'>
            {collections.map((collection) => {
              const theme = resourceService.getThemeByName(collection.name);
              return (
                <View
                  key={collection.id}
                  className='my__route-item'
                  onClick={() => handleRouteClick(collection)}
                >
                  <View
                    className='my__route-cover'
                    style={{ background: collection.coverImage ? '#fff' : theme.gradient }}
                  >
                    {collection.coverImage ? (
                      <Image className='my__route-img' src={collection.coverImage} mode='aspectFill' />
                    ) : (
                      <ThemeShape geoType={theme.geoType} />
                    )}
                  </View>
                  <View className='my__route-info'>
                    <Text className='my__route-name'>{collection.name}</Text>
                    <Text className='my__route-meta'>{collection.places.length} 个地点</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
