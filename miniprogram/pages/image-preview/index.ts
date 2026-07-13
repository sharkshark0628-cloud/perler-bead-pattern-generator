import { getGenerationSessionState } from '../../stores/generation-session-store'

type PreviewState = 'ready' | 'warning' | 'invalid'

function getImageSizeLabel(width?: number, height?: number): string {
  return width && height ? `${width} x ${height}` : ''
}

Page({
  data: {
    guideItems: [
      { label: '主体清晰' },
      { label: '光线充足' },
      { label: '背景简单' },
      { label: '分辨率较高' },
    ],
    hasSelectedImage: false,
    selectedImagePath: '',
    imageSizeLabel: '',
    previewState: 'ready' as PreviewState,
  },
  onLoad(this: any) {
    this.syncImagePreview()
  },
  onShow(this: any) {
    this.syncImagePreview()
  },
  syncImagePreview(this: any) {
    const session = getGenerationSessionState()
    const tempFilePath = session.imagePreview?.reference?.tempFilePath ?? ''
    const metadata = session.imagePreview?.metadata

    this.setData({
      hasSelectedImage: tempFilePath.length > 0,
      selectedImagePath: tempFilePath,
      imageSizeLabel: getImageSizeLabel(metadata?.width, metadata?.height),
    })
  },
  handleBack() {
    wx.navigateBack()
  },
  handleNext() {
    wx.navigateTo({
      url: '/pages/generation-settings/index',
    })
  },
})
