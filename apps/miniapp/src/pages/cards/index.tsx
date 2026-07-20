import { View, Text, Input, Image, ScrollView } from '@tarojs/components';
import { useState, useEffect, useRef } from 'react';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import { fetchPlaces, searchPlaces } from '../../services/place';
import { loginWithWx } from '../../services/auth';
import { useUserStore } from '../../stores/userStore';
import { resourceService } from '../../services/resource';
import AnnouncementModal from '../../components/AnnouncementModal';
import ThemeShape from '../../components/ThemeShape';
import type { PlaceDto } from '@zuji/shared-types';
import './index.scss';

// 场景化筛选词（用户语言）
type FilterKey = 'all' | 'frequent' | 'revisit' | 'restaurant' | 'cafe' | 'travel' | 'shopping';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'frequent', label: '常去的' },
  { key: 'revisit', label: '想再去' },
  { key: 'restaurant', label: '餐厅' },
  { key: 'cafe', label: '咖啡店' },
  { key: 'travel', label: '旅行' },
  { key: 'shopping', label: '购物' },
];

// 排序：时间筛选退到排序按钮里
type SortKey = 'recent' | 'checkin' | 'year' | 'date';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: '最近添加' },
  { key: 'checkin', label: '打卡最多' },
  { key: 'year', label: '按年' },
  { key: 'date', label: '按日期' },
];

export default function Cards() {
  const { user, setUser } = useUserStore();
  const [places, setPlaces] = useState<PlaceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  // 搜索状态
  const [searchMode, setSearchMode] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceDto[]>([]);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const isFirstLoad = useRef(true);

  // 本地筛选 + 后端排序
  const loadPlaces = async () => {
    setLoading(true);
    try {
      const res = await fetchPlaces({ sort, page: 1, pageSize: 50 });
      setPlaces(res.list);
      if (res.list.length > 0) {
        Taro.setStorageSync('zuji_onboarding_done', 'true');
      }
    } catch (e) {
      console.error('加载地点失败:', e);
    } finally {
      setLoading(false);
    }
  };

  // 搜索
  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchPlaces(keyword.trim());
      setSearchResults(results);
    } catch (e) {
      console.error('搜索失败:', e);
    }
  };

  // 本地筛选：根据场景过滤已加载的地点
  const filterPlaces = (list: PlaceDto[]): PlaceDto[] => {
    if (filter === 'all') return list;
    return list.filter((p) => {
      const tagNames = p.tags.map(t => t.name);
      const attrType = p.tags.find(t => t.type === 'attribute')?.name || '';
      const sceneType = p.tags.find(t => t.type === 'scene')?.name || '';
      switch (filter) {
        case 'frequent':
          return p.checkinCount >= 2;
        case 'revisit':
          return (p as any).wantToRevisit === true;
        case 'restaurant':
          return tagNames.some(n => ['美食', '餐厅', '吃饭', '火锅', '烧烤'].includes(n));
        case 'cafe':
          return tagNames.some(n => ['咖啡', '饮品', '下午茶'].includes(n));
        case 'travel':
          return sceneType === '旅行' || tagNames.includes('旅行');
        case 'shopping':
          return tagNames.some(n => ['购物', '商场'].includes(n));
        default:
          return true;
      }
    });
  };

  useEffect(() => {
    if (user) {
      loadPlaces();
    }
    const timer = setTimeout(() => setShowAnnouncement(true), 1000);
    isFirstLoad.current = false;
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sort]);

  useDidShow(() => {
    if (isFirstLoad.current) return;
    if (user) loadPlaces();
  });

  usePullDownRefresh(() => {
    if (user) {
      loadPlaces().finally(() => Taro.stopPullDownRefresh());
    } else {
      Taro.stopPullDownRefresh();
    }
  });

  const handleLogin = async () => {
    setLoginLoading(true);
    Taro.showLoading({ title: '正在开启...', mask: true });
    try {
      const { user: u } = await loginWithWx();
      setUser(u);
      Taro.getLocation({ type: 'gcj02' }).catch(() => {});
      Taro.hideLoading();
    } catch (e) {
      Taro.hideLoading();
      console.error('登录失败:', e);
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' });
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

  const handleStartOnboarding = () => {
    Taro.setStorageSync('zuji_onboarding_done', 'true');
    Taro.navigateTo({ url: '/pages/place-create/index' });
  };

  const handleFeedback = () => {
    Taro.navigateTo({ url: '/pages-sub/extra/feedback/index' });
  };

  const firstAttributeTag = (place: PlaceDto) =>
    place.tags.find((t) => t.type === 'attribute');

  // 展示列表：搜索模式显示搜索结果，否则显示筛选后的列表
  const displayList = searchMode
    ? searchResults
    : filterPlaces(places);

  if (!user) {
    return (
      <View className='cards cards--login'>
        <View className='cards__login-logo'>
          <Image
            className='cards__login-logo-img'
            src={require('../../assets/logo/logo.png')}
            mode='aspectFit'
          />
        </View>
        <Text className='cards__login-title'>足迹手帐</Text>
        <Text className='cards__login-subtitle'>收藏每一次出发</Text>
        <View
          className={`cards__login-btn ${loginLoading ? 'cards__login-btn--disabled' : ''}`}
          onClick={loginLoading ? undefined : handleLogin}
        >
          <Text>{loginLoading ? '开启中...' : '开启我的手帐'}</Text>
        </View>
        <Text className='cards__login-hint'>微信授权登录后将开启你的地点收藏之旅</Text>
      </View>
    );
  }

  return (
    <View className='cards'>
      {/* 顶部栏：标题 + 排序 + 搜索 */}
      <View className='cards__header'>
        <Text className='cards__title'>我的地点</Text>
        <View className='cards__header-right'>
          {/* 排序按钮 */}
          <View className='cards__sort-btn' onClick={() => setShowSortMenu(!showSortMenu)}>
            <Text className='cards__sort-btn-text'>{SORTS.find(s => s.key === sort)?.label}</Text>
            <Text className='cards__sort-btn-arrow'>{showSortMenu ? '▲' : '▼'}</Text>
          </View>
          {/* 搜索按钮 */}
          <View
            className={`cards__search-icon ${searchMode ? 'cards__search-icon--active' : ''}`}
            onClick={() => {
              if (searchMode) {
                setSearchMode(false);
                setSearchKeyword('');
                setSearchResults([]);
              } else {
                setSearchMode(true);
              }
            }}
          />
        </View>

        {/* 排序下拉菜单 */}
        {showSortMenu && (
          <View className='cards__sort-menu'>
            {SORTS.map((s) => (
              <View
                key={s.key}
                className={`cards__sort-menu-item ${sort === s.key ? 'cards__sort-menu-item--active' : ''}`}
                onClick={() => {
                  setSort(s.key);
                  setShowSortMenu(false);
                }}
              >
                <Text>{s.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 搜索框（展开式） */}
      {searchMode && (
        <View className='cards__search-box'>
          <Input
            className='cards__search-input'
            value={searchKeyword}
            onInput={(e) => handleSearch(e.detail.value)}
            placeholder='搜索地点名称或标签...'
            focus
          />
          {searchKeyword && (
            <View
              className='cards__search-clear'
              onClick={() => {
                setSearchKeyword('');
                setSearchResults([]);
              }}
            >
              <Text>×</Text>
            </View>
          )}
        </View>
      )}

      {/* 场景化筛选栏（搜索模式隐藏） */}
      {!searchMode && (
        <ScrollView className='cards__filters' scrollX>
          {FILTERS.map((f) => (
            <View
              key={f.key}
              className={`cards__filter ${filter === f.key ? 'cards__filter--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              <Text>{f.label}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* 列表 / 空状态 / 加载中 */}
      {loading && places.length === 0 ? (
        <View className='cards__loading'><Text>加载中...</Text></View>
      ) : displayList.length === 0 ? (
        // 空状态
        searchMode ? (
          <View className='cards__empty-wrap'>
            <View className='cards__empty-circle' />
            <View className='cards__empty-text-col'>
              <Text className='cards__empty-title'>没找到相关地点</Text>
              <Text className='cards__empty-sub'>试试其他关键词</Text>
            </View>
          </View>
        ) : !Taro.getStorageSync('zuji_onboarding_done') ? (
          // 新用户引导
          <View className='cards__onboarding'>
            <View className='cards__onboard-welcome'>
              <Text className='cards__onboard-welcome-title'>欢迎使用足迹手帐</Text>
              <Text className='cards__onboard-welcome-sub'>
                收藏每一个对你重要的地方，写下你和它的故事
              </Text>
            </View>
            <View className='cards__onboard-steps'>
              <View className='cards__onboard-step'>
                <View className='cards__onboard-step-num cards__onboard-step-num--1'>
                  <Text className='cards__onboard-step-num-text'>1</Text>
                </View>
                <View className='cards__onboard-step-content'>
                  <Text className='cards__onboard-step-title'>收藏第一个地点</Text>
                  <Text className='cards__onboard-step-desc'>
                    点击右下角 + 号，标记一个对你重要的地方
                  </Text>
                </View>
              </View>
              <View className='cards__onboard-step'>
                <View className='cards__onboard-step-num cards__onboard-step-num--2'>
                  <Text className='cards__onboard-step-num-text'>2</Text>
                </View>
                <View className='cards__onboard-step-content'>
                  <Text className='cards__onboard-step-title'>写下你的感受</Text>
                  <Text className='cards__onboard-step-desc'>
                    收藏时就能记录心情、上传照片
                  </Text>
                </View>
              </View>
              <View className='cards__onboard-step'>
                <View className='cards__onboard-step-num cards__onboard-step-num--3'>
                  <Text className='cards__onboard-step-num-text'>3</Text>
                </View>
                <View className='cards__onboard-step-content'>
                  <Text className='cards__onboard-step-title'>回顾你的旅程</Text>
                  <Text className='cards__onboard-step-desc'>
                    在「旅程」页看到所有足迹连成的地图
                  </Text>
                </View>
              </View>
            </View>
            <View className='cards__onboard-cta' onClick={handleStartOnboarding}>
              <Text className='cards__onboard-cta-text'>收藏第一个地点</Text>
            </View>
          </View>
        ) : (
          <View className='cards__empty-wrap'>
            <View className='cards__empty-circle' />
            <View className='cards__empty-text-col'>
              <Text className='cards__empty-title'>这个分类下还没有地点</Text>
              <Text className='cards__empty-sub'>试试其他筛选条件吧</Text>
            </View>
          </View>
        )
      ) : (
        // 双列卡片网格
        <View className='cards__grid'>
          {displayList.map((place) => {
            const theme = resourceService.getThemeByName(place.customName);
            const attrTag = firstAttributeTag(place);
            const sceneTag = place.tags.find((t) => t.type === 'scene');
            return (
              <View key={place.id} className='cards__cell'>
                <View
                  className='cards__card'
                  onClick={() => handleCardClick(place)}
                >
                  <View
                    className='cards__card-visual'
                    style={{ background: theme.gradient }}
                  >
                    <ThemeShape geoType={theme.geoType} />
                    <View className='cards__card-badge'>
                      <Text
                        className='cards__card-badge-text'
                        style={{ color: theme.accent }}
                      >
                        {place.customName.charAt(0)}
                      </Text>
                    </View>
                    <View className='cards__card-heart' />
                  </View>

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
