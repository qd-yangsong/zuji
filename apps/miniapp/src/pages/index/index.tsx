import { View, Text, Button } from '@tarojs/components';
import { useUserStore } from '../../stores/userStore';
import './index.scss';

/**
 * 页面入口占位（调试用，不作为用户可见页面）
 */
export default function Index() {
  const { user } = useUserStore();

  return (
    <View className='index'>
      <Text>足迹手帐</Text>
      {user ? (
        <Text>已登录：{user.openid}</Text>
      ) : (
        <Button
          onClick={() => {
            const Taro = require('@tarojs/taro').default;
            Taro.switchTab({ url: '/pages/cards/index' });
          }}
        >
          前往首页
        </Button>
      )}
    </View>
  );
}
