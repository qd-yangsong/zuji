import type { UserConfigExport } from '@tarojs/cli';

export default {
  mini: {},
  h5: {},
  defineConstants: {
    // 生产环境 API 地址 —— 部署时修改为你的域名
    'process.env.TARO_APP_API_BASE': JSON.stringify('https://你的域名.com/api'),
  },
} satisfies UserConfigExport;
