import { View, Text } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { fetchPlaces } from '../../services/place';
import { loginWithWx } from '../../services/auth';
import { useUserStore } from '../../stores/userStore';
import { resourceService } from '../../services/resource';
import AnnouncementModal from '../../components/AnnouncementModal';
import ThemeShape from '../../components/ThemeShape';
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
  const [showAnnouncement, setShowAnnouncement] = useState(false);

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
    // 页面加载后延迟 1 秒检查公告
    const timer = setTimeout(() => setShowAnnouncement(true), 1000);
    return () => clearTimeout(timer);
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

  const handleFeedback = () => {
    Taro.navigateTo({ url: '/pages/feedback/index' });
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
      {/* 顶部标题栏 */}
      <View className='cards__header'>
        <Text className='cards__title'>我的地点</Text>
        <View className='cards__search' onClick={() => Taro.showToast({ title: '搜索即将上线', icon: 'none' })}>
          <View className='cards__search-icon' />
          <Text className='cards__search-label'>搜索</Text>
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
        // 空状态：纯文字 + CSS 装饰圆形
        <View className='cards__empty-wrap'>
          <View className='cards__empty-circle' />
          <View className='cards__empty-text-col'>
            <Text className='cards__empty-title'>还没有收藏任何地点</Text>
            <Text className='cards__empty-sub'>去标记第一个对你重要的地方吧</Text>
          </View>
        </View>
      ) : (
        // 整齐双列网格（每张卡片等高对齐）
        <View className='cards__grid'>
          {places.map((place) => {
            const theme = resourceService.getThemeByName(place.customName);
            const attrTag = firstAttributeTag(place);
            const sceneTag = place.tags.find((t) => t.type === 'scene');
            return (
              <View key={place.id} className='cards__cell'>
                <View
                  className='cards__card'
                  onClick={() => handleCardClick(place)}
                >
                  {/* 上半部分：主题渐变背景 + CSS 几何图形 */}
                  <View
                    className='cards__card-visual'
                    style={{ background: theme.gradient }}
                  >
                    <ThemeShape geoType={theme.geoType as any} />
                    {/* 左上首字圆形徽章：白底 + accent 文字色 */}
                    <View className='cards__card-badge'>
                      <Text
                        className='cards__card-badge-text'
                        style={{ color: theme.accent }}
                      >
                        {place.customName.charAt(0)}
                      </Text>
                    </View>
                    {/* 右上收藏爱心：纯 CSS 绘制 */}
                    <View className='cards__card-heart' />
                  </View>

                  {/* 下半部分：地点信息 */}
                  <View className='cards__card-info'>
                    <Text className='cards__card-name'>{place.customName}</Text>
                    <Text className='cards__card-sub'>{place.realName}</Text>
                    <View className='cards__card-meta'>
                      <Text className='cards__card-checkin'>
                        {place.checkinCount > 0 ? `打卡 ${place.checkinCount} 次` : '还没打过卡'}
                      </Text>
                      {attrTag && (
                        <Text
                          className='cards__card-attrtag'
                          style={{ background: theme.light, color: theme.accent }}
                        >
                          {attrTag.name}
                        </Text>
                      )}
                    </View>
                    {sceneTag && (
                      <View
                        className='cards__card-scenetag'
                        style={{ background: theme.light }}
                      >
                        <Text style={{ color: theme.accent }}>适合{sceneTag.name}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* 浮动反馈按钮 */}
      <View className='cards__fab cards__fab--feedback' onClick={handleFeedback}>
        <View className='cards__fab-icon cards__fab-icon--feedback' />
        <Text className='cards__fab-label'>反馈</Text>
      </View>

      {/* 浮动添加按钮 */}
      <View className='cards__fab' onClick={handleAddPlace}>
        <Text className='cards__fab-icon'>+</Text>
      </View>

      {/* 公告弹窗 */}
      <AnnouncementModal
        visible={showAnnouncement}
        onClose={() => setShowAnnouncement(false)}
      />

    </View>
  );
}
