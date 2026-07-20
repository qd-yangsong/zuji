import { View, Text, Map as TaroMap, ScrollView, Image } from '@tarojs/components';
import { useState, useMemo, useEffect, useRef } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { fetchJourneyMap } from '../../services/collection';
import { fetchTimeline, fetchYearSummary } from '../../services/place';
import { resourceService } from '../../services/resource';
import type { JourneyMarkerDto, TimelineEntryDto, YearSummaryDto } from '@zuji/shared-types';
import './index.scss';

// 视图模式：时序（生活全景）/ 路线（旅行特写）
type ViewMode = 'timeline' | 'map';

export default function Journey() {
  const [mode, setMode] = useState<ViewMode>('timeline');
  const [markers, setMarkers] = useState<JourneyMarkerDto[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntryDto[]>([]);
  const [summary, setSummary] = useState<YearSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<JourneyMarkerDto | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const isFirstLoad = useRef(true);

  const loadData = () => {
    setLoading(true);
    // 并行加载：地图标记 + 时间线 + 年度总结
    Promise.all([
      fetchJourneyMap(),
      fetchTimeline(selectedYear),
      fetchYearSummary(selectedYear),
    ])
      .then(([m, t, s]) => {
        setMarkers(m);
        setTimeline(t);
        setSummary(s);
      })
      .catch((e) => {
        console.error('加载旅程数据失败:', e);
        Taro.showToast({ title: '加载失败，请下拉刷新', icon: 'none' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [selectedYear]);

  useDidShow(() => {
    if (!isFirstLoad.current) loadData();
    isFirstLoad.current = false;
  });

  // 统计
  const totalCheckins = useMemo(
    () => markers.reduce((sum, m) => sum + m.checkinCount, 0),
    [markers],
  );
  const areaCount = useMemo(() => {
    const uniqueKeys = new Set(
      markers.map((m) => `${m.latitude.toFixed(1)},${m.longitude.toFixed(1)}`),
    );
    return uniqueKeys.size;
  }, [markers]);

  // 地图中心点
  const center = useMemo(() => {
    if (markers.length === 0) return { latitude: 39.908, longitude: 116.397 };
    const sum = markers.reduce(
      (acc, m) => ({ latitude: acc.latitude + m.latitude, longitude: acc.longitude + m.longitude }),
      { latitude: 0, longitude: 0 },
    );
    return { latitude: sum.latitude / markers.length, longitude: sum.longitude / markers.length };
  }, [markers]);

  const mapMarkers = useMemo(() => markers.map((m, idx) => ({
    id: idx,
    latitude: m.latitude,
    longitude: m.longitude,
    width: 32,
    height: 32,
    iconPath: '',
    callout: {
      content: m.customName,
      color: '#3D3226',
      fontSize: 12,
      borderRadius: 8,
      padding: 6,
      display: 'BYCLICK',
    },
  })) as any[], [markers]);

  // 时间线按月分组
  const timelineByMonth = useMemo(() => {
    const groups: { month: number; label: string; entries: TimelineEntryDto[] }[] = [];
    const monthMap = new Map<number, TimelineEntryDto[]>();
    timeline.forEach((entry) => {
      const month = new Date(entry.checkinAt).getMonth() + 1;
      if (!monthMap.has(month)) monthMap.set(month, []);
      monthMap.get(month)!.push(entry);
    });
    // 按月降序
    const sortedMonths: number[] = [];
    monthMap.forEach((_, k) => sortedMonths.push(k));
    sortedMonths.sort((a, b) => b - a);
    const monthNames = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
    sortedMonths.forEach((month) => {
      groups.push({ month, label: monthNames[month - 1], entries: monthMap.get(month)! });
    });
    return groups;
  }, [timeline]);

  const handleMarkerTap = (e: any) => {
    const idx = e.detail.markerId;
    setSelected(markers[idx]);
  };

  const handleCardClick = () => {
    if (selected) {
      Taro.navigateTo({ url: `/pages/place-detail/index?id=${selected.placeId}` });
    }
  };

  const handleTimelineClick = (placeId: string) => {
    Taro.navigateTo({ url: `/pages/place-detail/index?id=${placeId}` });
  };

  const selectedTheme = selected
    ? resourceService.getThemeByName(selected.customName)
    : null;

  // 年份切换
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2].filter(
    (y) => y >= 2020,
  );

  if (loading) {
    return (
      <View className='journey'>
        <View className='journey__loading'><Text>加载中...</Text></View>
      </View>
    );
  }

  // 新用户空状态
  if (markers.length === 0 && timeline.length === 0) {
    return (
      <View className='journey'>
        <View className='journey__empty'>
          <View className='journey__empty-circle' />
          <Text className='journey__empty-title'>开始你的故事</Text>
          <Text className='journey__empty-sub'>
            收藏地点、记录感受{'\n'}你的足迹会在这里连成一条时间线
          </Text>
          <View
            className='journey__empty-btn'
            onClick={() => Taro.switchTab({ url: '/pages/record/index' })}
          >
            <Text>去记录</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className='journey'>
      {/* 顶部视图切换 */}
      <View className='journey__mode-bar'>
        <View
          className={`journey__mode-btn ${mode === 'timeline' ? 'journey__mode-btn--active' : ''}`}
          onClick={() => setMode('timeline')}
        >
          <Text>时间线</Text>
        </View>
        <View
          className={`journey__mode-btn ${mode === 'map' ? 'journey__mode-btn--active' : ''}`}
          onClick={() => setMode('map')}
        >
          <Text>足迹地图</Text>
        </View>
      </View>

      {/* 统计卡片 */}
      <View className='journey__stats'>
        <View className='journey__stat'>
          <Text className='journey__stat-num journey__stat-num--place'>{markers.length}</Text>
          <Text className='journey__stat-label'>地点</Text>
        </View>
        <View className='journey__stat'>
          <Text className='journey__stat-num journey__stat-num--checkin'>{totalCheckins}</Text>
          <Text className='journey__stat-label'>打卡</Text>
        </View>
        <View className='journey__stat'>
          <Text className='journey__stat-num journey__stat-num--city'>{areaCount}</Text>
          <Text className='journey__stat-label'>区域</Text>
        </View>
        {summary && summary.routeCount > 0 && (
          <View className='journey__stat'>
            <Text className='journey__stat-num journey__stat-num--route'>{summary.routeCount}</Text>
            <Text className='journey__stat-label'>旅程</Text>
          </View>
        )}
      </View>

      {/* 时间线视图 */}
      {mode === 'timeline' && (
        <ScrollView className='journey__timeline' scrollY>
          {/* 年份切换 */}
          <View className='journey__year-bar'>
            {years.map((y) => (
              <View
                key={y}
                className={`journey__year ${selectedYear === y ? 'journey__year--active' : ''}`}
                onClick={() => setSelectedYear(y)}
              >
                <Text>{y}</Text>
              </View>
            ))}
          </View>

          {/* 年度总结卡 */}
          {summary && (
            <View className='journey__summary'>
              <Text className='journey__summary-title'>{selectedYear} 年足迹</Text>
              <Text className='journey__summary-desc'>
                收藏了 {summary.placeCount} 个地点 · 打卡 {summary.checkinCount} 次 · 走过 {summary.uniquePlaceCount} 个地方
              </Text>
              {summary.topMonth && (
                <Text className='journey__summary-highlight'>
                  最活跃的月份：{['一','二','三','四','五','六','七','八','九','十','十一','十二'][summary.topMonth - 1]}月
                </Text>
              )}
            </View>
          )}

          {/* 按月分组的时间线 */}
          {timelineByMonth.length === 0 ? (
            <View className='journey__timeline-empty'>
              <Text>这一年还没有记录</Text>
            </View>
          ) : (
            timelineByMonth.map((group) => (
              <View key={group.month} className='journey__month-group'>
                <View className='journey__month-header'>
                  <View className='journey__month-dot' />
                  <Text className='journey__month-label'>{group.label}</Text>
                  <Text className='journey__month-count'>{group.entries.length} 次</Text>
                </View>
                <View className='journey__month-line' />
                <View className='journey__month-entries'>
                  {group.entries.map((entry) => (
                    <View
                      key={entry.id}
                      className='journey__timeline-item'
                      onClick={() => handleTimelineClick(entry.placeId)}
                    >
                      <View className='journey__timeline-date'>
                        <Text className='journey__timeline-day'>
                          {new Date(entry.checkinAt).getDate()}
                        </Text>
                      </View>
                      <View className='journey__timeline-card'>
                        <Text className='journey__timeline-name'>{entry.placeName}</Text>
                        {entry.content && (
                          <Text className='journey__timeline-content'>{entry.content}</Text>
                        )}
                        {entry.images && entry.images.length > 0 && (
                          <View className='journey__timeline-images'>
                            {entry.images.slice(0, 3).map((img, i) => (
                              <Image
                                key={i}
                                className='journey__timeline-img'
                                src={img}
                                mode='aspectFill'
                              />
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* 地图视图 */}
      {mode === 'map' && (
        <View className='journey__map-wrap'>
          <TaroMap
            className='journey__map'
            latitude={center.latitude}
            longitude={center.longitude}
            markers={mapMarkers}
            scale={12}
            onMarkerTap={handleMarkerTap}
            onError={() => {}}
          />

          {selected && selectedTheme && (
            <View className='journey__card' onClick={handleCardClick}>
              <View className='journey__card-body'>
                <View
                  className='journey__card-badge'
                  style={{ background: selectedTheme.gradient }}
                >
                  <Text className='journey__card-badge-text'>
                    {selected.customName.charAt(0)}
                  </Text>
                </View>
                <View className='journey__card-info'>
                  <View className='journey__card-header'>
                    <Text className='journey__card-name'>{selected.customName}</Text>
                    <Text className='journey__card-arrow'>›</Text>
                  </View>
                  <Text className='journey__card-sub'>{selected.realName}</Text>
                  <View className='journey__card-meta'>
                    <Text
                      className='journey__card-checkin'
                      style={{ color: selectedTheme.accent, background: selectedTheme.light }}
                    >
                      打卡 {selected.checkinCount} 次
                    </Text>
                    {selected.lastCheckinAt && (
                      <Text className='journey__card-last'>
                        最近：{new Date(selected.lastCheckinAt).toLocaleDateString('zh-CN')}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
