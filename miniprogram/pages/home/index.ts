interface HomeTabItem {
  ariaLabel: string
  icon?: string
  key: string
  label: string
}

Page({
  data: {
    explanationItems: [
      { label: '选择图片' },
      { label: '方案推荐' },
      { label: '完成图纸' },
    ],
    tabItems: [
      { ariaLabel: '首页', key: 'home', label: '首页' },
      { ariaLabel: '我的图纸', key: 'patterns', label: '我的图纸' },
      { ariaLabel: '我的', key: 'profile', label: '我的' },
    ] as HomeTabItem[],
  },
  handleMoreTap() {
    console.log('More action placeholder')
  },
  handleTabChange(event: WechatMiniprogram.CustomEvent<{ key: string }>) {
    console.log('Tab change placeholder', event.detail.key)
  },
  handleUploadTap() {
    wx.navigateTo({
      url: '/pages/image-preview/index',
    })
  },
})
