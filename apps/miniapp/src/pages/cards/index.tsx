import { View, Text, Image } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { fetchPlaces } from '../../services/place';
import { loginWithWx } from '../../services/auth';
import { useUserStore } from '../../stores/userStore';
import { resourceService } from '../../services/resource';
import type { PlaceDto, ThemeResource } from '@zuji/shared-types';
import './index.scss';

type SortKey = 'recent' | 'year' | 'date' | 'checkin';

const SORT_TABS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: '最近添加' },
  { key: 'year', label: '按年' },
  { key: 'date', label: '按日期' },
  { key: 'checkin', label: '打卡次数' },
];

export default function Cards() {
  const { user, setUser } = useUserStore();
  const [places, setPlaces] = useState<PlaceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<SortKey>('recent');
  const [loginLoading, setLoginLoading] = useState(false);

  const loadPlaces = async () => {
    setLoading(true);
    try {
      const res = await fetchPlaces({ sort, page: 1, pageSize: 20 });
      setPlaces(res.list);
    } catch (e) {
      console.error('加载地点失败:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPlaces();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sort]);

  usePullDownRefresh(() => {
    if (user) {
      loadPlaces().finally(() => Taro.stopPullDownRefresh());
    } else {
      Taro.stopPullDownRefresh();
    }
  });

  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      const { user: u } = await loginWithWx();
      setUser(u);
    } catch (e) {
      console.error('登录失败:', e);
      Taro.showToast({ title: '登录失败', icon: 'error' });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleCardClick = (place: PlaceDto) => {
    Taro.navigateTo({ url: `/pages/place-detail/index?id=${place.id}` });
  };

  const handleAddPlace = () => {
    Taro.navigateTo({ url: '/pages/place-create/index' });
  };

  // 选第一个属性标签（如"美食"）作为分类彩标色
  const firstAttributeTag = (place: PlaceDto) =>
    place.tags.find((t) => t.type === 'attribute');

  if (!user) {
    return (
      <View className='cards cards--login'>
        <Text className='cards__login-text'>请先登录查看你的地点收藏</Text>
        <View
          className={`cards__login-btn ${loginLoading ? 'cards__login-btn--disabled' : ''}`}
          onClick={loginLoading ? undefined : handleLogin}
        >
          <Text>{loginLoading ? '登录中...' : '微信一键登录'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className='cards'>
      {/* 顶部标题栏（带四角小装饰） */}
      <View className='cards__header'>
        <Text className='cards__deco cards__deco--tl'>✦</Text>
        <Text className='cards__deco cards__deco--tr'>✦</Text>
        <Text className='cards__deco cards__deco--bl'>✧</Text>
        <Text className='cards__deco cards__deco--br'>✧</Text>
        <Text className='cards__title'>我的地点</Text>
        <View className='cards__search' onClick={() => Taro.showToast({ title: '搜索即将上线', icon: 'none' })}>
          <Text className='cards__search-icon'>⌕</Text>
        </View>
      </View>

      {/* 排序栏 */}
      <View className='cards__sort-bar'>
        {SORT_TABS.map((tab) => (
          <View
            key={tab.key}
            className={`cards__sort-tab ${sort === tab.key ? 'cards__sort-tab--active' : ''}`}
            onClick={() => setSort(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      {/* 卡片列表 / 空状态 / 加载中 */}
      {loading && places.length === 0 ? (
        <View className='cards__loading'>
          <Text>加载中...</Text>
        </View>
      ) : places.length === 0 ? (
        // 空状态：设计图中的"还没有收藏"提示卡片
        <View className='cards__empty-wrap'>
          <View className='cards__empty-card'>
            <View className='cards__empty-icon'>
              <Text>📍</Text>
            </View>
            <View className='cards__empty-text-col'>
              <Text className='cards__empty-title'>还没有收藏任何地点</Text>
              <Text className='cards__empty-sub'>去标记第一个对你重要的地方吧</Text>
            </View>
          </View>
        </View>
      ) : (
        // 整齐双列网格（与设计图一致：每张卡片等高对齐）
        <View className='cards__grid'>
          {places.map((place) => {
            const theme = resourceService.getThemeByName(place.customName);
            const attrTag = firstAttributeTag(place);
            const sceneTag = place.tags.find((t) => t.type === 'scene');
            return (
              <View key={place.id} className='cards__cell'>
                <View
                  className='cards__card'
                  style={{ background: theme.bg }}
                  onClick={() => handleCardClick(place)}
                >
                  {/* 角落装饰（与设计图同款：星/钻/爱心） */}
                  <Text className='cards__card-deco'>{theme.deco}</Text>
                  <Text className='cards__card-heart'>♡</Text>

                  {/* 中央 3D 插画占位（emoji） */}
                  <View className='cards__card-illu'>
                    <Text className='cards__card-emoji'>{theme.emoji}</Text>
                  </View>

                  {/* 左上首字圆形图标 */}
                  <View
                    className='cards__card-badge'
                    style={{ background: theme.iconBg }}
                  >
                    <Text style={{ color: theme.iconColor }}>
                      {place.customName.charAt(0)}
                    </Text>
                  </View>

                  {/* 底部信息 */}
                  <View className='cards__card-info'>
                    <Text className='cards__card-name'>{place.customName}</Text>
                    <Text className='cards__card-sub'>{place.realName}</Text>
                    <View className='cards__card-meta'>
                      <Text className='cards__card-checkin'>
                        {place.checkinCount > 0 ? `打卡 ${place.checkinCount} 次` : '还没打过卡'}
                      </Text>
                      {attrTag && (
                        <Text className='cards__card-attrtag'>{attrTag.name}</Text>
                      )}
                    </View>
                    {sceneTag && (
                      <View className='cards__card-scenetag'>
                        <Text>适合{sceneTag.name}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* 浮动添加按钮 */}
      <View className='cards__fab' onClick={handleAddPlace}>
        <Text className='cards__fab-icon'>+</Text>
      </View>

      {/* 底部 TabBar（地点/发现/我的） */}
      <View className='cards__tabbar'>
        <View className='cards__tab cards__tab--active'>
          <Text className='cards__tab-icon'>📍</Text>
          <Text className='cards__tab-label'>地点</Text>
        </View>
        <View className='cards__tab' onClick={() => Taro.showToast({ title: '发现即将上线', icon: 'none' })}>
          <Text className='cards__tab-icon'>◫</Text>
          <Text className='cards__tab-label'>发现</Text>
        </View>
        <View className='cards__tab' onClick={() => Taro.showToast({ title: '我的即将上线', icon: 'none' })}>
          <Text className='cards__tab-icon'>👤</Text>
          <Text className='cards__tab-label'>我的</Text>
        </View>
      </View>
    </View>
  );
}
