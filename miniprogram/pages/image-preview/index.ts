import { updateImagePreviewState } from '../../stores/generation-session-store'

type PreviewState = 'ready' | 'warning' | 'invalid'

Page({
  data: {
    guideItems: [
      { label: '主体清晰' },
      { label: '光线充足' },
      { label: '背景简单' },
      { label: '分辨率较高' },
    ],
    previewState: 'ready' as PreviewState,
  },
  onLoad() {
    updateImagePreviewState({
      metadata: {},
    })
  },
  handleBack() {
    wx.navigateBack()
  },
  handleNext() {
    updateImagePreviewState({
      metadata: {},
    })

    wx.navigateTo({
      url: '/pages/generation-settings/index',
    })
  },
})
