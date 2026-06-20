import { View, Text, Input, Textarea, Image, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { createCollection } from '../../services/collection';
import { fetchPlaces } from '../../services/place';
import { uploadImage } from '../../services/upload';
import { resourceService } from '../../services/resource';
import type { PlaceDto } from '@zuji/shared-types';
import './index.scss';

export default function CollectionCreate() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [places, setPlaces] = useState<PlaceDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // 加载用户所有地点供选择
  useEffect(() => {
    fetchPlaces({ page: 1, pageSize: 100 })
      .then((res) => setPlaces(res.list))
      .catch(console.error);
  }, []);

  const handleUploadCover = async () => {
    const res = await Taro.chooseImage({ count: 1 });
    Taro.showLoading({ title: '上传中...' });
    try {
      const url = await uploadImage(res.tempFilePaths[0]);
      setCoverImage(url);
    } catch (e) {
      Taro.showToast({ title: '上传失败', icon: 'error' });
    } finally {
      Taro.hideLoading();
    }
  };

  const togglePlace = (placeId: string) => {
    if (selectedIds.includes(placeId)) {
      setSelectedIds(selectedIds.filter((id) => id !== placeId));
    } else {
      setSelectedIds([...selectedIds, placeId]);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入合集名称', icon: 'none' });
      return;
    }
    setSubmitting(true);
    try {
      await createCollection({
        name: name.trim(),
        description: description || undefined,
        coverImage: coverImage || undefined,
        placeIds: selectedIds,
      });
      Taro.showToast({ title: '创建成功', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1500);
    } catch (e) {
      Taro.showToast({ title: '创建失败', icon: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className='collection-create'>
      {/* 基本信息 */}
      <View className='collection-create__section'>
        <Text className='collection-create__label'>合集名称</Text>
        <Input
          className='collection-create__input'
          value={name}
          onInput={(e) => setName(e.detail.value)}
          placeholder='如：成都美食10选'
          maxlength={50}
        />
      </View>

      <View className='collection-create__section'>
        <Text className='collection-create__label'>描述（选填）</Text>
        <Textarea
          className='collection-create__textarea'
          value={description}
          onInput={(e) => setDescription(e.detail.value)}
          placeholder='简单描述这个合集...'
          maxlength={200}
          autoHeight
        />
      </View>

      <View className='collection-create__section'>
        <Text className='collection-create__label'>封面图（选填）</Text>
        <View className='collection-create__cover-area' onClick={handleUploadCover}>
          {coverImage ? (
            <Image className='collection-create__cover-img' src={coverImage} mode='aspectFill' />
          ) : (
            <View className='collection-create__cover-placeholder'>
              <Text className='collection-create__cover-add'>+ 点击上传</Text>
            </View>
          )}
        </View>
      </View>

      {/* 选择地点 */}
      <View className='collection-create__section'>
        <Text className='collection-create__label'>
          选择地点（已选 {selectedIds.length} 个）
        </Text>
        {places.length === 0 ? (
          <Text className='collection-create__no-places'>还没有收藏的地点</Text>
        ) : (
          <View className='collection-create__place-list'>
            {places.map((place) => {
              const isSelected = selectedIds.includes(place.id);
              const theme = resourceService.getThemeByName(place.customName);
              return (
                <View
                  key={place.id}
                  className={`collection-create__place-item ${isSelected ? 'collection-create__place-item--selected' : ''}`}
                  onClick={() => togglePlace(place.id)}
                >
                  <View
                    className='collection-create__place-badge'
                    style={{ background: theme.iconBg }}
                  >
                    <Text style={{ color: theme.iconColor }}>
                      {place.customName.charAt(0)}
                    </Text>
                  </View>
                  <View className='collection-create__place-info'>
                    <Text className='collection-create__place-name'>{place.customName}</Text>
                    <Text className='collection-create__place-sub'>{place.realName}</Text>
                  </View>
                  <View
                    className={`collection-create__checkbox ${isSelected ? 'collection-create__checkbox--checked' : ''}`}
                  >
                    {isSelected && <Text className='collection-create__check'>✓</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* 提交按钮 */}
      <View className='collection-create__footer'>
        <View
          className={`collection-create__submit ${submitting ? 'collection-create__submit--disabled' : ''}`}
          onClick={submitting ? undefined : handleSubmit}
        >
          <Text>{submitting ? '创建中...' : '创建合集'}</Text>
        </View>
      </View>
    </View>
  );
}
