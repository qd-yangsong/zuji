import Taro from '@tarojs/taro';

/**
 * 通过微信原生 getTabBar() 直接操作当前页面的 TabBar 组件实例。
 * 避免直接 import custom-tab-bar（webpack 会剥离命名导出）。
 */
export function syncTabBar(index: number) {
  try {
    const page = Taro.getCurrentInstance().page as any;
    const tabBar = page?.getTabBar?.();
    if (tabBar && typeof tabBar.setSelected === 'function') {
      tabBar.setSelected(index);
    }
  } catch (e) {
    console.warn('syncTabBar failed:', e);
  }
}
