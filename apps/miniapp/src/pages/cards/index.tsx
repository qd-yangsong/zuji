import { View, Text, Image } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { fetchPlaces } from '../../services/place';
import { loginWithWx } from '../../services/auth';
import { useUserStore } from '../../stores/userStore';
import type { PlaceDto } from '@zuji/shared-types';
import './index.scss';

type SortKey = 'recent' | 'year' | 'date' | 'checkin';

const SORT_TABS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: '最近添加' },
  { key: 'year', label: '按年' },
  { key: 'date', label: '按日期' },
  { key: 'checkin', label: '打卡次数' },
];

// 无封面时的占位色板
const PLACEHOLDER_COLORS = ['#54A0FF', '#48DBFB', '#FF6B6B', '#FFD93D', '#6BCB77', '#FF9F43'];

export default function Cards() {
  const { user, setUser } = useUserStore();
  const [places, setPlaces] = useState<PlaceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<SortKey>('recent');
  const [loginLoading, setLoginLoading] = useState(false);

  // 加载地点列表
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

  // 登录态变化或排序切换时重新加载
  useEffect(() => {
    if (user) {
      loadPlaces();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sort]);

  // 下拉刷新
  usePullDownRefresh(() => {
    if (user) {
      loadPlaces().finally(() => Taro.stopPullDownRefresh());
    } else {
      Taro.stopPullDownRefresh();
    }
  });

  // 微信一键登录
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

  // 根据昵称首字生成占位背景色
  const getPlaceholderColor = (name: string) => {
    const idx = name.charCodeAt(0) % PLACEHOLDER_COLORS.length;
    return PLACEHOLDER_COLORS[idx];
  };

  // 未登录时显示登录引导
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
        <View className='cards__empty'>
          <Text className='cards__empty-text'>
            还没有收藏任何地点，点击 + 标记第一个对你重要的地方
          </Text>
        </View>
      ) : (
        <View className='cards__list'>
          {places.map((place) => (
            <View key={place.id} className='cards__item'>
              <View className='cards__card' onClick={() => handleCardClick(place)}>
                {/* 封面图（有封面用图片，无封面用纯色占位+首字） */}
                <View className='cards__cover'>
                  {place.coverImage ? (
                    <Image className='cards__cover-img' src={place.coverImage} mode='aspectFill' />
                  ) : (
                    <View
                      className='cards__cover-placeholder'
                      style={{ background: getPlaceholderColor(place.customName) }}
                    >
                      <Text className='cards__cover-letter'>
                        {place.customName.charAt(0)}
                      </Text>
                    </View>
                  )}
                </View>
                {/* 卡片信息 */}
                <View className='cards__info'>
                  <Text className='cards__custom-name'>{place.customName}</Text>
                  <Text className='cards__real-name'>{place.realName}</Text>
                  <Text className='cards__checkin'>
                    {place.checkinCount > 0 ? `打卡 ${place.checkinCount} 次` : '还没打过卡'}
                  </Text>
                  {place.tags.length > 0 && (
                    <View className='cards__tags'>
                      {place.tags.slice(0, 2).map((tag) => (
                        <Text key={tag.id} className='cards__tag'>
                          {tag.name}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 浮动添加按钮 */}
      <View className='cards__fab' onClick={handleAddPlace}>
        <Text className='cards__fab-icon'>+</Text>
      </View>
    </View>
  );
}
