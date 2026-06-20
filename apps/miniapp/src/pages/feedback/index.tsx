import { View, Text, Textarea, Input, Image } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { submitFeedback } from '../../services/feedback';
import { uploadImage } from '../../services/upload';
import './index.scss';

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug', emoji: '🐛' },
  { value: 'suggestion', label: '建议', emoji: '💡' },
  { value: 'complaint', label: '投诉', emoji: '😤' },
  { value: 'other', label: '其他', emoji: '📝' },
];

export default function Feedback() {
  const [type, setType] = useState('suggestion');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChooseImage = async () => {
    if (images.length >= 3) {
      Taro.showToast({ title: '最多上传3张截图', icon: 'none' });
      return;
    }
    const res = await Taro.chooseImage({ count: 3 - images.length });
    Taro.showLoading({ title: '上传中...' });
    try {
      const urls = await Promise.all(res.tempFilePaths.map(uploadImage));
      setImages([...images, ...urls]);
    } catch (e) {
      Taro.showToast({ title: '上传失败', icon: 'error' });
    } finally {
      Taro.hideLoading();
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Taro.showToast({ title: '请输入反馈内容', icon: 'none' });
      return;
    }
    setSubmitting(true);
    try {
      const sysInfo = Taro.getSystemInfoSync();
      await submitFeedback({
        type,
        content: content.trim(),
        images,
        contact: contact || undefined,
        appVersion: sysInfo.version,
        platform: `${sysInfo.brand} ${sysInfo.model}`,
      });
      Taro.showToast({ title: '反馈已提交', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1500);
    } catch (e) {
      Taro.showToast({ title: '提交失败', icon: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className='feedback'>
      {/* 类型选择 */}
      <View className='feedback__section'>
        <Text className='feedback__label'>反馈类型</Text>
        <View className='feedback__types'>
          {FEEDBACK_TYPES.map((t) => (
            <View
              key={t.value}
              className={`feedback__type ${type === t.value ? 'feedback__type--active' : ''}`}
              onClick={() => setType(t.value)}
            >
              <Text className='feedback__type-emoji'>{t.emoji}</Text>
              <Text>{t.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 内容输入 */}
      <View className='feedback__section'>
        <Text className='feedback__label'>详细描述</Text>
        <Textarea
          className='feedback__textarea'
          value={content}
          onInput={(e) => setContent(e.detail.value)}
          placeholder='请描述你遇到的问题或建议...'
          maxlength={1000}
          autoHeight
        />
        <Text className='feedback__count'>{content.length}/1000</Text>
      </View>

      {/* 截图上传 */}
      <View className='feedback__section'>
        <Text className='feedback__label'>截图（选填，最多3张）</Text>
        <View className='feedback__images'>
          {images.map((img, idx) => (
            <View key={idx} className='feedback__image-item'>
              <Image className='feedback__image' src={img} mode='aspectFill' />
              <View className='feedback__image-remove' onClick={() => handleRemoveImage(idx)}>×</View>
            </View>
          ))}
          {images.length < 3 && (
            <View className='feedback__image-add' onClick={handleChooseImage}>
              <Text className='feedback__image-add-icon'>+</Text>
            </View>
          )}
        </View>
      </View>

      {/* 联系方式 */}
      <View className='feedback__section'>
        <Text className='feedback__label'>联系方式（选填）</Text>
        <Input
          className='feedback__input'
          value={contact}
          onInput={(e) => setContact(e.detail.value)}
          placeholder='微信号 / 手机号，方便我们联系你'
        />
      </View>

      {/* 提交按钮 */}
      <View className='feedback__submit-area'>
        <View
          className={`feedback__submit ${submitting ? 'feedback__submit--disabled' : ''}`}
          onClick={submitting ? undefined : handleSubmit}
        >
          <Text>{submitting ? '提交中...' : '提交反馈'}</Text>
        </View>
      </View>
    </View>
  );
}
