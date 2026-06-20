import { View, Text, Button } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { loginWithWx } from '../../services/auth';
import { uploadImage } from '../../services/upload';
import { useUserStore } from '../../stores/userStore';
import TagSelector from '../../components/TagSelector';
import './index.scss';

export default function Index() {
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [selectedAttrTags, setSelectedAttrTags] = useState<string[]>([]);
  const [selectedEventTags, setSelectedEventTags] = useState<string[]>([]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { user: u } = await loginWithWx();
      setUser(u);
    } catch (e: any) {
      console.error('登录失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const res = await Taro.chooseImage({ count: 1 });
      const url = await uploadImage(res.tempFilePaths[0]);
      Taro.showToast({ title: '上传成功' });
      console.log('uploaded:', url);
    } catch (e: any) {
      console.error('上传失败:', e);
      Taro.showToast({ title: '上传失败', icon: 'error' });
    }
  };

  return (
    <View className='index'>
      <Text>足迹手帐</Text>
      {user ? (
        <>
          <Text>已登录：{user.openid}</Text>
          <Button onClick={handleUpload}>测试上传图片</Button>
          <View className='index__section'>
            <Text className='index__label'>属性标签</Text>
            <TagSelector
              type='attribute'
              selectedIds={selectedAttrTags}
              onChange={setSelectedAttrTags}
            />
          </View>
          <View className='index__section'>
            <Text className='index__label'>事件标签</Text>
            <TagSelector
              type='event'
              selectedIds={selectedEventTags}
              onChange={setSelectedEventTags}
            />
          </View>
        </>
      ) : (
        <Button loading={loading} onClick={handleLogin}>
          微信一键登录
        </Button>
      )}
    </View>
  );
}
