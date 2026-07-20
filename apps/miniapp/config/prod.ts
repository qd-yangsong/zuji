import type { UserConfigExport } from '@tarojs/cli';

export default {
  mini: {
    // 主包体积优化：提取公共模块
    optimizeMainPackage: {
      enable: true,
    },
    // 启用 JS 压缩（生产模式默认开启）
    webpackChain(chain) {
      chain.optimization.minimize(true);
    },
  },
  h5: {},
  defineConstants: {
    // 生产环境 API 地址 —— 部署时修改为你的域名
    'process.env.TARO_APP_API_BASE': JSON.stringify('https://track.highnix.cn/api'),
  },
} satisfies UserConfigExport;
