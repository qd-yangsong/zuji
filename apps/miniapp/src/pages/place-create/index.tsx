import { View, Text, Input, Map, Image, Textarea } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { createPlace, fetchPlaceDetail, updatePlace } from '../../services/place';
import { uploadImage } from '../../services/upload';
import TagSelector from '../../components/TagSelector';
import './index.scss';

interface LatLng {
  latitude: number;
  longitude: number;
}

// 首次感受照片（最多6张），每张带本地路径 + 上传后 URL
interface ImpressionPhoto {
  localPath: string;
  uploadedUrl?: string;
}

export default function PlaceCreate() {
  const [center, setCenter] = useState<LatLng>({ latitude: 39.908, longitude: 116.397 });
  const [selectedPoint, setSelectedPoint] = useState<LatLng | null>(null);
  const [locStatus, setLocStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  // 基础信息
  const [realName, setRealName] = useState('');
  const [customName, setCustomName] = useState('');
  const [address, setAddress] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [attributeTagIds, setAttributeTagIds] = useState<string[]>([]);
  const [sceneTagIds, setSceneTagIds] = useState<string[]>([]);

  // 「收藏即记录」字段
  const [firstImpression, setFirstImpression] = useState('');
  const [impressionPhotos, setImpressionPhotos] = useState<ImpressionPhoto[]>([]);
  const [rating, setRating] = useState(0);
  const [wantToRevisit, setWantToRevisit] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const editId = Taro.getCurrentInstance().router?.params?.id;
  const isEdit = !!editId;

  const autoLocate = async () => {
    setLocStatus('loading');
    try {
      const res = await Taro.getLocation({ type: 'gcj02' });
      const loc = { latitude: res.latitude, longitude: res.longitude };
      setCenter(loc);
      setSelectedPoint(loc);
      setLocStatus('success');
    } catch {
      setLocStatus('failed');
    }
  };

  useEffect(() => {
    if (isEdit) return;
    autoLocate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editId) return;
    fetchPlaceDetail(editId)
      .then((p) => {
        setRealName(p.realName);
        setCustomName(p.customName);
        setAddress(p.address || '');
        setCoverImage(p.coverImage || '');
        setSelectedPoint({ latitude: p.latitude, longitude: p.longitude });
        setCenter({ latitude: p.latitude, longitude: p.longitude });
        setLocStatus('success');
        const attrTags = p.tags.filter(t => t.type === 'attribute').map(t => t.id);
        const sceneTags = p.tags.filter(t => t.type === 'scene').map(t => t.id);
        setAttributeTagIds(attrTags);
        setSceneTagIds(sceneTags);
      })
      .catch((e) => {
        console.error('加载地点详情失败:', e);
        Taro.showToast({ title: '加载失败', icon: 'error' });
      });
  }, [editId]);

  const handleChooseLocation = async () => {
    Taro.showLoading({ title: '正在打开地图...', mask: true });
    try {
      const res = await Taro.chooseLocation({
        latitude: selectedPoint?.latitude || center.latitude,
        longitude: selectedPoint?.longitude || center.longitude,
      });
      Taro.hideLoading();
      const loc = { latitude: res.latitude, longitude: res.longitude };
      setSelectedPoint(loc);
      setCenter(loc);
      setLocStatus('success');
      if (!address && res.address) setAddress(res.address);
      if (!realName && res.name) setRealName(res.name);
    } catch (e: any) {
      Taro.hideLoading();
      const errMsg = e?.errMsg || '';
      if (errMsg.includes('cancel')) return;
      if (errMsg.includes('auth deny') || errMsg.includes('permission')) {
        Taro.showModal({
          title: '需要定位权限',
          content: '开启定位权限后可自动定位到你的位置',
          confirmText: '去设置',
          cancelText: '关闭',
          success: (modalRes) => { if (modalRes.confirm) Taro.openSetting(); },
        });
        return;
      }
      Taro.showToast({ title: '打开地图失败，请重试', icon: 'none', duration: 2000 });
    }
  };

  const handleMapClick = (e: { detail: { latitude: number; longitude: number } }) => {
    const point = { latitude: e.detail.latitude, longitude: e.detail.longitude };
    setSelectedPoint(point);
    setCenter(point);
  };

  // 选择封面图
  const handleChooseCover = async () => {
    try {
      const mediaRes = await Taro.chooseMedia({ count: 1, mediaType: ['image'], sourceType: ['album', 'camera'] });
      const tempFilePath = mediaRes.tempFiles[0].tempFilePath;
      setUploadingImage(true);
      const url = await uploadImage(tempFilePath);
      setCoverImage(url);
    } catch (err: any) {
      if (!err?.errMsg?.includes('cancel')) {
        Taro.showToast({ title: err?.message || '上传失败', icon: 'none', duration: 3000 });
      }
    } finally {
      setUploadingImage(false);
    }
  };

  // 选择打卡照片（支持多选，最多6张）
  const handleChoosePhotos = async () => {
    const remaining = 6 - impressionPhotos.length;
    if (remaining <= 0) {
      Taro.showToast({ title: '最多上传6张照片', icon: 'none' });
      return;
    }
    try {
      const mediaRes = await Taro.chooseMedia({
        count: remaining,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
      });
      const newPhotos: ImpressionPhoto[] = mediaRes.tempFiles.map(f => ({ localPath: f.tempFilePath }));
      setImpressionPhotos(prev => [...prev, ...newPhotos]);
    } catch (err: any) {
      if (err?.errMsg?.includes('cancel')) return;
    }
  };

  // 删除打卡照片
  const handleRemovePhoto = (index: number) => {
    setImpressionPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // 提交
  const handleSubmit = async () => {
    if (!realName.trim()) { Taro.showToast({ title: '请输入真实名称', icon: 'none' }); return; }
    if (!customName.trim()) { Taro.showToast({ title: '请输入自定义昵称', icon: 'none' }); return; }
    if (!selectedPoint) { Taro.showToast({ title: '请在地图上选择地点', icon: 'none' }); return; }

    setSubmitting(true);
    try {
      // 先上传打卡照片
      const uploadedUrls: string[] = [];
      for (const photo of impressionPhotos) {
        if (photo.uploadedUrl) {
          uploadedUrls.push(photo.uploadedUrl);
        } else {
          const url = await uploadImage(photo.localPath);
          uploadedUrls.push(url);
        }
      }

      const payload = {
        realName: realName.trim(),
        customName: customName.trim(),
        latitude: selectedPoint.latitude,
        longitude: selectedPoint.longitude,
        address: address.trim() || undefined,
        coverImage: coverImage || undefined,
        attributeTagIds,
        sceneTagIds,
        firstImpression: firstImpression.trim() || undefined,
        firstImages: uploadedUrls.length > 0 ? uploadedUrls : undefined,
        rating: rating > 0 ? rating : undefined,
        wantToRevisit: wantToRevisit || undefined,
      };

      if (isEdit && editId) {
        await updatePlace(editId, payload as any);
        Taro.showToast({ title: '修改成功', icon: 'success' });
      } else {
        await createPlace(payload as any);
        Taro.showToast({ title: '已放入我的手帐', icon: 'success' });
      }
      setTimeout(() => Taro.navigateBack(), 1000);
    } catch (err) {
      console.error('保存地点失败:', err);
      Taro.showToast({ title: isEdit ? '修改失败' : '保存失败', icon: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const markers = selectedPoint
    ? [{ id: 1, latitude: selectedPoint.latitude, longitude: selectedPoint.longitude, width: 30, height: 30, iconPath: '' }]
    : [];

  return (
    <View className='pc'>
      {/* 地图区域 */}
      <View className='pc__map-wrap'>
        <Map
          className='pc__map'
          latitude={center.latitude}
          longitude={center.longitude}
          markers={markers}
          scale={16}
          onClick={handleMapClick}
          onError={() => {}}
        />
        {locStatus === 'loading' && (
          <View className='pc__loc-overlay'>
            <View className='pc__loc-spinner' />
            <Text className='pc__loc-text'>定位中...</Text>
          </View>
        )}
        {locStatus === 'failed' && (
          <View className='pc__loc-overlay pc__loc-overlay--clickable' onClick={handleChooseLocation}>
            <Text className='pc__loc-text'>点击选择位置</Text>
            <Text className='pc__loc-sub'>支持搜索地点名称或地址</Text>
          </View>
        )}
        {locStatus === 'success' && (
          <View className='pc__search-btn' onClick={handleChooseLocation}>
            <Text className='pc__search-btn-text'>搜索地点</Text>
          </View>
        )}
      </View>

      {/* 表单 - 基础信息区 */}
      <View className='pc__section'>
        <Text className='pc__section-title'>📌 地点信息</Text>

        {/* 封面 */}
        <View className='pc__cover' onClick={handleChooseCover}>
          {coverImage ? (
            <Image className='pc__cover-img' src={coverImage} mode='aspectFill' />
          ) : (
            <View className='pc__cover-placeholder'>
              <Text className='pc__cover-text'>{uploadingImage ? '上传中...' : '+ 添加封面照片'}</Text>
            </View>
          )}
        </View>

        <View className='pc__field'>
          <Text className='pc__label'>真实名称</Text>
          <Input className='pc__input' value={realName} onInput={(e) => setRealName(e.detail.value)} placeholder='如：星巴克（南京西路店）' maxlength={100} />
        </View>

        <View className='pc__field'>
          <Text className='pc__label'>我的昵称</Text>
          <Input className='pc__input' value={customName} onInput={(e) => setCustomName(e.detail.value)} placeholder='给这个地方起个容易记的名字' maxlength={50} />
        </View>

        <View className='pc__field'>
          <Text className='pc__label'>地址</Text>
          <Input className='pc__input' value={address} onInput={(e) => setAddress(e.detail.value)} placeholder='选填' maxlength={200} />
        </View>

        {/* 标签 */}
        <View className='pc__tags'>
          <Text className='pc__tag-title'>属性标签</Text>
          <TagSelector type='attribute' selectedIds={attributeTagIds} onChange={setAttributeTagIds} />
        </View>
        <View className='pc__tags'>
          <Text className='pc__tag-title'>场景标签</Text>
          <TagSelector type='scene' selectedIds={sceneTagIds} onChange={setSceneTagIds} />
        </View>
      </View>

      {/* 表单 - 感受记录区 */}
      <View className='pc__section pc__section--impression'>
        <Text className='pc__section-title'>📝 记录此刻的感受</Text>
        <Text className='pc__section-hint'>选填，跳过也没关系</Text>

        {/* 感受文字 */}
        <View className='pc__field'>
          <Textarea
            className='pc__textarea'
            value={firstImpression}
            onInput={(e) => setFirstImpression(e.detail.value)}
            placeholder='今天为什么来这里？有什么想记住的瞬间...'
            maxlength={500}
            autoHeight
          />
        </View>

        {/* 打卡照片 */}
        <View className='pc__photos'>
          {impressionPhotos.map((photo, index) => (
            <View key={index} className='pc__photo-item'>
              <Image className='pc__photo-img' src={photo.uploadedUrl || photo.localPath} mode='aspectFill' />
              <View className='pc__photo-remove' onClick={() => handleRemovePhoto(index)}>
                <Text className='pc__photo-remove-x'>×</Text>
              </View>
            </View>
          ))}
          {impressionPhotos.length < 6 && (
            <View className='pc__photo-add' onClick={handleChoosePhotos}>
              <Text className='pc__photo-add-plus'>+</Text>
              <Text className='pc__photo-add-text'>添加照片</Text>
            </View>
          )}
        </View>

        {/* 评分 */}
        <View className='pc__field'>
          <Text className='pc__label'>评分</Text>
          <View className='pc__rating'>
            {[1, 2, 3, 4, 5].map((star) => (
              <View
                key={star}
                className={`pc__rating-star ${star <= rating ? 'pc__rating-star--active' : ''}`}
                onClick={() => setRating(star === rating ? 0 : star)}
              >
                <Text>{star <= rating ? '★' : '☆'}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 想再去 */}
        <View className='pc__field pc__field--row'>
          <Text className='pc__label pc__label--inline'>想再去</Text>
          <View
            className={`pc__toggle ${wantToRevisit ? 'pc__toggle--on' : ''}`}
            onClick={() => setWantToRevisit(!wantToRevisit)}
          >
            <View className='pc__toggle-knob' />
          </View>
        </View>
      </View>

      {/* 底部按钮 */}
      <View className='pc__footer'>
        <View
          className={`pc__submit ${submitting ? 'pc__submit--disabled' : ''}`}
          onClick={submitting ? undefined : handleSubmit}
        >
          <Text>{submitting ? '保存中...' : (isEdit ? '保存修改' : '放入我的手帐')}</Text>
        </View>
      </View>
    </View>
  );
}
