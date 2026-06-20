import { View, Text, Button } from '@tarojs/components';
import { useState } from 'react';
import { loginWithWx } from '../../services/auth';
import { useUserStore } from '../../stores/userStore';
import './index.scss';

export default function Index() {
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(false);

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

  return (
    <View className='index'>
      <Text>足迹手帐</Text>
      {user ? (
        <Text>已登录：{user.openid}</Text>
      ) : (
        <Button loading={loading} onClick={handleLogin}>
          微信一键登录
        </Button>
      )}
    </View>
  );
}
