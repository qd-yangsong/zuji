import { View, Text, Image, Map } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { fetchPlaceDetail } from '../../services/place';
import { fetchCheckins } from '../../services/checkin';
import { resourceService } from '../../services/resource';
import type { PlaceDto, TagDto, TagType, CheckInDto } from '@zuji/shared-types';
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

export default function PlaceDetail() {
  const [place, setPlace] = useState<PlaceDto | null>(null);
  const [checkins, setCheckins] = useState<CheckInDto[]>([]);
  const [loading, setLoading] = useState(true);

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
    // 同时加载打卡时间轴
    fetchCheckins(id).then(setCheckins).catch(console.error);
  }, [id]);

  const handleCheckin = () => {
    if (!place) return;
    Taro.navigateTo({ url: '/pages/checkin/index?placeId=' + place.id });
  };

  const handleShare = () => {
    Taro.showToast({ title: '分享功能即将上线', icon: 'none' });
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleMore = () => {
    Taro.showActionSheet({
      itemList: ['编辑地点', '删除地点'],
      success: (res) => {
        if (res.tapIndex === 1) {
          Taro.showModal({
            title: '确认删除',
            content: '删除后无法恢复，确定吗？',
            success: (r) => {
              if (r.confirm) Taro.showToast({ title: '删除功能即将上线', icon: 'none' });
            },
          });
        } else if (res.tapIndex === 0) {
          Taro.showToast({ title: '编辑功能即将上线', icon: 'none' });
        }
      },
    });
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

  const theme = resourceService.getThemeByName(place.customName);
  const attributeTags = filterTagsByType(place.tags, 'attribute');
  const sceneTags = filterTagsByType(place.tags, 'scene');
  const markers = [
    { id: 1, latitude: place.latitude, longitude: place.longitude, width: 30, height: 30 },
  ];

  return (
    <View className='place-detail'>
      {/* 顶部导航（返回 + 标题 + 更多） */}
      <View className='place-detail__nav'>
        <View className='place-detail__nav-btn' onClick={handleBack}>
          <Text className='place-detail__nav-icon'>‹</Text>
        </View>
        <Text className='place-detail__nav-title'>地点详情</Text>
        <View className='place-detail__nav-btn' onClick={handleMore}>
          <Text className='place-detail__nav-icon place-detail__nav-icon--more'>⋯</Text>
        </View>
      </View>

      {/* 封面区：渐变背景 + 首字装饰 + 角落装饰 */}
      <View className='place-detail__cover' style={{ background: theme.gradient }}>
        <Text className='place-detail__cover-deco place-detail__cover-deco--tl'>✦</Text>
        <Text className='place-detail__cover-deco place-detail__cover-deco--tr'>✧</Text>
        <Text className='place-detail__cover-deco place-detail__cover-deco--bl'>✦</Text>
        <Text className='place-detail__cover-deco place-detail__cover-deco--br'>✧</Text>

        {/* 左侧大号首字 + emoji 装饰 */}
        <View className='place-detail__cover-left'>
          <View
            className='place-detail__cover-badge'
            style={{ background: theme.iconBg }}
          >
            <Text
              className='place-detail__cover-letter'
              style={{ color: theme.iconColor }}
            >
              {place.customName.charAt(0)}
            </Text>
          </View>
          <Text className='place-detail__cover-emoji'>{theme.emoji}</Text>
        </View>

        {/* 右侧封面图（有则用实景图，无则用 emoji 占位） */}
        <View className='place-detail__cover-right'>
          {place.coverImage ? (
            <Image
              className='place-detail__cover-img'
              src={place.coverImage}
              mode='aspectFill'
            />
          ) : (
            <View className='place-detail__cover-img-fake'>
              <Text className='place-detail__cover-img-emoji'>{theme.emoji}</Text>
            </View>
          )}
          {/* 角落小图片装饰（设计图中的"小食"图） */}
          <View className='place-detail__cover-corner'>
            <Text className='place-detail__cover-corner-emoji'>{theme.deco}</Text>
          </View>
        </View>
      </View>

      {/* 信息卡片（圆角向上覆盖封面底部） */}
      <View className='place-detail__body'>
        <Text className='place-detail__custom-name'>{place.customName}</Text>
        <View className='place-detail__meta'>
          <Text className='place-detail__pin'>📍</Text>
          <Text className='place-detail__real-name'>{place.realName}</Text>
          {place.address && <Text className='place-detail__address'> · {place.address}</Text>}
        </View>

        {/* 标签分组：属性 + 场景 */}
        {(attributeTags.length > 0 || sceneTags.length > 0) && (
          <View className='place-detail__tag-block'>
            {attributeTags.length > 0 && (
              <View className='place-detail__tag-row'>
                <Text className='place-detail__tag-label'>属性</Text>
                <View className='place-detail__tags'>
                  {attributeTags.map((tag) => (
                    <Text
                      key={tag.id}
                      className='place-detail__tag place-detail__tag--attribute'
                    >
                      {tag.name}
                    </Text>
                  ))}
                </View>
              </View>
            )}
            {sceneTags.length > 0 && (
              <View className='place-detail__tag-row'>
                <Text className='place-detail__tag-label'>场景</Text>
                <View className='place-detail__tags'>
                  {sceneTags.map((tag) => (
                    <Text
                      key={tag.id}
                      className='place-detail__tag place-detail__tag--scene'
                    >
                      适合{tag.name}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* 统计信息 */}
        <View className='place-detail__divider' />
        <View className='place-detail__stats'>
          <Text className='place-detail__stats-item'>
            <Text className='place-detail__stats-icon'>★</Text>
            {' '}打卡 {place.checkinCount} 次
          </Text>
          <Text className='place-detail__stats-dot'>·</Text>
          <Text className='place-detail__stats-item'>收藏于 {formatDate(place.collectedAt)}</Text>
        </View>

        {/* 记忆时间轴 */}
        {checkins.length > 0 && (
          <View className='place-detail__timeline'>
            <View className='place-detail__timeline-header'>
              <Text className='place-detail__timeline-title'>记忆时间轴</Text>
              <Text className='place-detail__timeline-count'>{checkins.length} 条记录</Text>
            </View>
            {checkins.map((checkin, idx) => (
              <View key={checkin.id} className='place-detail__timeline-item'>
                {/* 时间轴线 */}
                <View className='place-detail__timeline-dot' />
                {idx < checkins.length - 1 && <View className='place-detail__timeline-line' />}

                <View className='place-detail__timeline-content'>
                  <Text className='place-detail__timeline-date'>
                    {formatDate(checkin.checkinAt)}
                    {checkin.isFirst && <Text className='place-detail__timeline-badge'>首次收藏</Text>}
                  </Text>
                  {/* 事件标签 */}
                  {checkin.tags.length > 0 && (
                    <View className='place-detail__timeline-tags'>
                      {checkin.tags.map((tag) => (
                        <Text key={tag.id} className='place-detail__timeline-tag'>
                          #{tag.name}
                        </Text>
                      ))}
                    </View>
                  )}
                  {/* 文字内容 */}
                  {checkin.content && (
                    <Text className='place-detail__timeline-text'>{checkin.content}</Text>
                  )}
                  {/* 图片缩略图 */}
                  {checkin.images.length > 0 && (
                    <View className='place-detail__timeline-images'>
                      {checkin.images.map((url, i) => (
                        <Image
                          key={i}
                          className='place-detail__timeline-image'
                          src={url}
                          mode='aspectFill'
                          onClick={() => Taro.previewImage({ urls: checkin.images, current: url })}
                        />
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 小地图缩略（只读，显示该地点 marker + 路标装饰） */}
        <View className='place-detail__map-block'>
          <View className='place-detail__map-title'>
            <Text className='place-detail__map-icon'>📍</Text>
            <Text className='place-detail__map-label'>位置</Text>
          </View>
          <View className='place-detail__map-wrapper'>
            <Map
              className='place-detail__map'
              latitude={place.latitude}
              longitude={place.longitude}
              markers={markers}
              scale={16}
            />
            {/* 右下角路标装饰（设计图中的小细节） */}
            <View className='place-detail__map-sign'>
              <Text className='place-detail__map-sign-icon'>➤</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 底部操作按钮 */}
      <View className='place-detail__footer'>
        <View className='place-detail__btn place-detail__btn--primary' onClick={handleCheckin}>
          <Text className='place-detail__btn-icon'>👤</Text>
          <Text className='place-detail__btn-text'>打卡</Text>
        </View>
        <View
          className='place-detail__btn place-detail__btn--outline'
          onClick={handleShare}
        >
          <Text className='place-detail__btn-icon'>↑</Text>
          <Text className='place-detail__btn-text'>分享</Text>
        </View>
      </View>
    </View>
  );
}
