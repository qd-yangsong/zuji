import { View, Text, Input, Map, Image } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { createPlace } from '../../services/place';
import { uploadImage } from '../../services/upload';
import TagSelector from '../../components/TagSelector';
import './index.scss';

interface LatLng {
  latitude: number;
  longitude: number;
}

export default function PlaceCreate() {
  // 地图中心点（默认北京坐标，获取定位后更新为用户当前位置）
  const [center, setCenter] = useState<LatLng>({ latitude: 39.908, longitude: 116.397 });
  // 用户在地图上选中的点
  const [selectedPoint, setSelectedPoint] = useState<LatLng | null>(null);
  // 表单字段
  const [realName, setRealName] = useState('');
  const [customName, setCustomName] = useState('');
  const [address, setAddress] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  // 标签选中 ID
  const [attributeTagIds, setAttributeTagIds] = useState<string[]>([]);
  const [sceneTagIds, setSceneTagIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // 获取当前定位，设为地图中心
  useEffect(() => {
    Taro.getLocation({ type: 'gcj02' })
      .then((res) => {
        const loc = { latitude: res.latitude, longitude: res.longitude };
        setCenter(loc);
        setSelectedPoint(loc);
      })
      .catch(() => {
        Taro.showToast({ title: '获取定位失败，请点击地图选点', icon: 'none' });
      });
  }, []);

  // 点击地图选点
  const handleMapClick = (e: { detail: { latitude: number; longitude: number } }) => {
    const point = { latitude: e.detail.latitude, longitude: e.detail.longitude };
    setSelectedPoint(point);
    setCenter(point);
  };

  // 选择并上传封面图
  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({ count: 1 });
      setUploadingImage(true);
      const url = await uploadImage(res.tempFilePaths[0]);
      setCoverImage(url);
    } catch (err) {
      console.error('上传封面失败:', err);
      Taro.showToast({ title: '上传失败', icon: 'error' });
    } finally {
      setUploadingImage(false);
    }
  };

  // 提交创建地点
  const handleSubmit = async () => {
    if (!realName.trim()) {
      Taro.showToast({ title: '请输入真实名称', icon: 'none' });
      return;
    }
    if (!customName.trim()) {
      Taro.showToast({ title: '请输入自定义昵称', icon: 'none' });
      return;
    }
    if (!selectedPoint) {
      Taro.showToast({ title: '请在地图上选择地点', icon: 'none' });
      return;
    }

    setSubmitting(true);
    try {
      await createPlace({
        realName: realName.trim(),
        customName: customName.trim(),
        latitude: selectedPoint.latitude,
        longitude: selectedPoint.longitude,
        address: address.trim() || undefined,
        coverImage: coverImage || undefined,
        attributeTagIds,
        sceneTagIds,
      });
      Taro.showToast({ title: '收藏成功', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1000);
    } catch (err) {
      console.error('创建地点失败:', err);
      Taro.showToast({ title: '创建失败', icon: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const markers =
    selectedPoint != null
      ? [
          {
            id: 1,
            latitude: selectedPoint.latitude,
            longitude: selectedPoint.longitude,
            width: 30,
            height: 30,
          },
        ]
      : [];

  return (
    <View className='place-create'>
      {/* 顶部地图选点区域 */}
      <Map
        className='place-create__map'
        latitude={center.latitude}
        longitude={center.longitude}
        markers={markers}
        scale={16}
        onClick={handleMapClick}
      />

      {/* 表单卡片 */}
      <View className='place-create__form'>
        {/* 封面图 */}
        <View className='place-create__cover' onClick={handleChooseImage}>
          {coverImage ? (
            <Image className='place-create__cover-img' src={coverImage} mode='aspectFill' />
          ) : (
            <View className='place-create__cover-placeholder'>
              <Text className='place-create__cover-text'>
                {uploadingImage ? '上传中...' : '+ 添加封面'}
              </Text>
            </View>
          )}
        </View>

        {/* 真实名称 */}
        <View className='place-create__field'>
          <Text className='place-create__label'>真实名称</Text>
          <Input
            className='place-create__input'
            value={realName}
            onInput={(e) => setRealName(e.detail.value)}
            placeholder='如：星巴克（南京西路店）'
            maxlength={100}
          />
        </View>

        {/* 自定义昵称 */}
        <View className='place-create__field'>
          <Text className='place-create__label'>自定义昵称</Text>
          <Input
            className='place-create__input'
            value={customName}
            onInput={(e) => setCustomName(e.detail.value)}
            placeholder='给这个地方起个容易记的名字'
            maxlength={50}
          />
        </View>

        {/* 地址 */}
        <View className='place-create__field'>
          <Text className='place-create__label'>地址</Text>
          <Input
            className='place-create__input'
            value={address}
            onInput={(e) => setAddress(e.detail.value)}
            placeholder='选填'
            maxlength={200}
          />
        </View>

        {/* 属性标签 */}
        <View className='place-create__tags'>
          <Text className='place-create__tag-title'>属性标签</Text>
          <TagSelector
            type='attribute'
            selectedIds={attributeTagIds}
            onChange={setAttributeTagIds}
          />
        </View>

        {/* 场景标签 */}
        <View className='place-create__tags'>
          <Text className='place-create__tag-title'>场景标签</Text>
          <TagSelector
            type='scene'
            selectedIds={sceneTagIds}
            onChange={setSceneTagIds}
          />
        </View>
      </View>

      {/* 底部提交按钮 */}
      <View className='place-create__footer'>
        <View
          className={`place-create__submit ${submitting ? 'place-create__submit--disabled' : ''}`}
          onClick={submitting ? undefined : handleSubmit}
        >
          <Text>{submitting ? '收藏中...' : '收藏这个地点'}</Text>
        </View>
      </View>
    </View>
  );
}
