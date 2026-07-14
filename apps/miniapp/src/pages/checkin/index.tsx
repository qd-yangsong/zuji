import { View, Text, Textarea, Image } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { fetchPlaceDetail } from '../../services/place';
import { createCheckin } from '../../services/checkin';
import { uploadImage } from '../../services/upload';
import TagSelector from '../../components/TagSelector';
import type { PlaceDto } from '@zuji/shared-types';
import './index.scss';

export default function Checkin() {
  const [place, setPlace] = useState<PlaceDto | null>(null);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [eventTagIds, setEventTagIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const placeId = Taro.getCurrentInstance().router?.params?.placeId;

  useEffect(() => {
    if (!placeId) return;
    fetchPlaceDetail(placeId).then(setPlace).catch(console.error);
  }, [placeId]);

  // 选择并上传图片
  const handleChooseImage = async () => {
    const res = await Taro.chooseImage({ count: 9 - images.length });
    Taro.showLoading({ title: '上传中...' });
    try {
      const urls = await Promise.all(
        res.tempFilePaths.map((path) => uploadImage(path))
      );
      setImages([...images, ...urls]);
    } catch (e) {
      Taro.showToast({ title: '上传失败', icon: 'error' });
    } finally {
      Taro.hideLoading();
    }
  };

  // 删除已选图片
  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  // 提交打卡
  const handleSubmit = async () => {
    if (eventTagIds.length === 0 && !content && images.length === 0) {
      Taro.showToast({ title: '请至少填写一项内容', icon: 'none' });
      return;
    }
    setSubmitting(true);
    try {
      await createCheckin({
        placeId: placeId!,
        content: content || undefined,
        images,
        eventTagIds,
      });
      // 成功后触觉反馈，增强放入珍珠的仪式感
      Taro.vibrateShort();
      Taro.showToast({ title: '打卡成功', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1500);
    } catch (e) {
      Taro.showToast({ title: '打卡失败', icon: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!place) {
    return (
      <View className='checkin'>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View className='checkin'>
      {/* 珍珠仪式区 */}
      <View className='checkin__pearl-zone'>
        <View className='checkin__pearl' />
        <Text className='checkin__pearl-title'>给这颗珍珠写句话</Text>
        <Text className='checkin__place-name'>{place.customName}</Text>
        <Text className='checkin__place-sub'>{place.realName}</Text>
      </View>

      {/* 文字日记 */}
      <View className='checkin__section'>
        <Text className='checkin__label'>写点什么...</Text>
        <Textarea
          className='checkin__textarea'
          value={content}
          onInput={(e) => setContent(e.detail.value)}
          placeholder='记录此刻的感受...'
          maxlength={500}
          autoHeight
        />
      </View>

      {/* 图片上传 */}
      <View className='checkin__section'>
        <Text className='checkin__label'>照片（{images.length}/9）</Text>
        <View className='checkin__images'>
          {images.map((url, idx) => (
            <View key={idx} className='checkin__image-item'>
              <Image className='checkin__image' src={url} mode='aspectFill' />
              <View className='checkin__image-del' onClick={() => handleRemoveImage(idx)}>
                <Text>×</Text>
              </View>
            </View>
          ))}
          {images.length < 9 && (
            <View className='checkin__image-add' onClick={handleChooseImage}>
              <Text className='checkin__image-add-icon'>+</Text>
            </View>
          )}
        </View>
      </View>

      {/* 事件标签 */}
      <View className='checkin__section'>
        <Text className='checkin__label'>这次来做什么？</Text>
        <TagSelector
          type='event'
          selectedIds={eventTagIds}
          onChange={setEventTagIds}
        />
      </View>

      {/* 提交按钮 */}
      <View className='checkin__footer'>
        <View
          className={`checkin__submit ${submitting ? 'checkin__submit--disabled' : ''}`}
          onClick={submitting ? undefined : handleSubmit}
        >
          <Text>{submitting ? '提交中...' : '放入珍珠'}</Text>
        </View>
      </View>
    </View>
  );
}
