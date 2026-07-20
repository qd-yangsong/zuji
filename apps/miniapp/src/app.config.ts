export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/cards/index',
    'pages/record/index',
    'pages/index/index',
    'pages/place-create/index',
    'pages/place-detail/index',
    'pages/checkin/index',
    'pages/journey/index',
    'pages/collections/index',
    'pages/collection-detail/index',
    'pages/collection-create/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '足迹手帐',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    custom: true,
    list: [
      { pagePath: 'pages/cards/index', text: '地点' },
      { pagePath: 'pages/record/index', text: '记录' },
      { pagePath: 'pages/journey/index', text: '旅程' },
      { pagePath: 'pages/collections/index', text: '我的' },
    ],
  },
  // 隐私接口权限声明（微信审核硬性要求）
  permission: {
    'scope.userLocation': {
      desc: '你的位置信息将用于在地图上标记你所收藏的地点',
    },
  },
  // 声明使用的隐私接口（仅限位置类 API，chooseMedia 无需在此声明）
  requiredPrivateInfos: [
    'getLocation',
    'chooseLocation',
  ],
  // 启用隐私授权弹窗
  __usePrivacyCheck__: true,

  // 启用组件按需注入（微信质量要求）
  lazyCodeLoading: 'requiredComponents',

  // 分包：将低频页面移出主包减小体积
  subpackages: [
    {
      root: 'pages-sub/static',
      name: 'static',
      pages: [
        'agreement/index',
        'privacy/index',
        'guide/index',
      ],
    },
    {
      root: 'pages-sub/extra',
      name: 'extra',
      pages: [
        'feedback/index',
        'share-place/index',
        'share-summary/index',
      ],
    },
  ],
});
