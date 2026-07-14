import { View, Text, Image, Map } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { fetchPlaceDetail } from '../../services/place';
import { fetchCheckins } from '../../services/checkin';
import { resourceService } from '../../services/resource';
import ThemeShape from '../../components/ThemeShape';
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

  // 微信原生分享：定义分享卡片内容
  Taro.useShareAppMessage(() => {
    if (!place) return { title: '足迹手帐' };
    return {
      title: `来看看这个地点：${place.customName}`,
      path: `/pages/share-place/index?id=${place.id}`,
    };
  });

  const handleShare = () => {
    // 触发微信原生分享（showShareMenu 已在页面配置中启用）
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });
    Taro.showToast({ title: '点击右上角分享给好友', icon: 'none' });
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

      {/* 审核状态提示条 */}
      {place.reviewStatus === 'rejected' && (
        <View className='place-detail__review-tip place-detail__review-tip--rejected'>
          <View className='place-detail__review-tip-dot' />
          <Text className='place-detail__review-tip-text'>
            该内容已被审核下架{place.reviewReason ? `，原因：${place.reviewReason}` : ''}
          </Text>
        </View>
      )}
      {place.reviewStatus === 'pending' && (
        <View className='place-detail__review-tip place-detail__review-tip--pending'>
          <View className='place-detail__review-tip-dot' />
          <Text className='place-detail__review-tip-text'>该内容正在审核中</Text>
        </View>
      )}

      {/* 封面区：纯 CSS 渐变背景 + 居中首字徽章 + ThemeShape 图形 */}
      <View className='place-detail__cover' style={{ background: theme.gradient }}>
        {/* 首字徽章：80rpx 白色圆形 */}
        <View className='place-detail__cover-badge'>
          <Text
            className='place-detail__cover-letter'
            style={{ color: theme.accent }}
          >
            {place.customName.charAt(0)}
          </Text>
        </View>
        {/* 主题几何图形（放大 1.3 倍） */}
        <View className='place-detail__cover-shape'>
          <ThemeShape geoType={theme.geoType as any} className='place-detail__cover-shape-inner' />
        </View>
      </View>

      {/* 信息卡片（圆角向上覆盖封面底部） */}
      <View className='place-detail__body'>
        <Text className='place-detail__custom-name'>{place.customName}</Text>
        <View className='place-detail__meta'>
          <View className='place-detail__pin-dot' />
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
                      className='place-detail__tag'
                      style={{ background: theme.light, color: theme.accent }}
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
                      className='place-detail__tag'
                      style={{ background: theme.light, color: theme.accent }}
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
                <View
                  className='place-detail__timeline-dot'
                  style={{ background: theme.accent }}
                />
                {idx < checkins.length - 1 && <View className='place-detail__timeline-line' />}

                <View className='place-detail__timeline-content'>
                  <Text className='place-detail__timeline-date'>
                    {formatDate(checkin.checkinAt)}
                    {checkin.isFirst && <Text className='place-detail__timeline-badge'>首次收藏</Text>}
                  </Text>
                  {checkin.reviewStatus === 'rejected' ? (
                    // 被拒打卡：仅展示下架提示，隐藏正文/图片
                    <Text className='place-detail__timeline-rejected'>
                      该打卡已被审核下架{checkin.reviewReason ? `，原因：${checkin.reviewReason}` : ''}
                    </Text>
                  ) : (
                    <>
                      {/* 事件标签 */}
                      {checkin.tags.length > 0 && (
                        <View className='place-detail__timeline-tags'>
                          {checkin.tags.map((tag) => (
                            <Text
                              key={tag.id}
                              className='place-detail__timeline-tag'
                              style={{ background: theme.light, color: theme.accent }}
                            >
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
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 小地图缩略（只读，显示该地点 marker） */}
        <View className='place-detail__map-block'>
          <View className='place-detail__map-title'>
            <View className='place-detail__map-pin-dot' />
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
            {/* 右下角主题装饰图形 */}
            <View className='place-detail__map-sign'>
              <ThemeShape geoType={theme.geoType as any} />
            </View>
          </View>
        </View>
      </View>

      {/* 底部操作按钮 */}
      <View className='place-detail__footer'>
        <View className='place-detail__btn place-detail__btn--primary' onClick={handleCheckin}>
          <Text className='place-detail__btn-text'>打卡</Text>
        </View>
        <View
          className='place-detail__btn place-detail__btn--outline'
          onClick={handleShare}
        >
          <Text className='place-detail__btn-text'>分享</Text>
          <Text className='place-detail__btn-sub'>即将上线</Text>
        </View>
      </View>
    </View>
  );
}
