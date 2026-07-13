import { updateImagePreviewState } from '../../stores/generation-session-store'

interface HomeTabItem {
  ariaLabel: string
  icon?: string
  key: string
  label: string
}

interface SelectedLocalImage {
  mimeType: string
  tempFilePath: string
  width: number
  height: number
}

const SUPPORTED_IMAGE_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

function chooseSingleImage(): Promise<WechatMiniprogram.ChooseMediaTempFile> {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['original', 'compressed'],
      success: (result) => {
        const selectedFile = result.tempFiles[0]

        if (!selectedFile) {
          reject(new Error('No image selected'))
          return
        }

        resolve(selectedFile)
      },
      fail: reject,
    })
  })
}

function getImageInfo(
  src: string,
): Promise<WechatMiniprogram.GetImageInfoSuccessCallbackResult> {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src,
      success: resolve,
      fail: reject,
    })
  })
}

function getImageTypeFromPath(path: string): string | undefined {
  const extension = path.split('?')[0]?.split('.').pop()?.toLowerCase()

  return extension && extension in SUPPORTED_IMAGE_TYPES
    ? extension
    : undefined
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (error && typeof error === 'object' && 'errMsg' in error) {
    return String((error as { readonly errMsg?: unknown }).errMsg ?? '')
  }

  return String(error ?? '')
}

async function validateSelectedImage(
  file: WechatMiniprogram.ChooseMediaTempFile,
): Promise<SelectedLocalImage> {
  if (file.fileType && file.fileType !== 'image') {
    throw new Error('Selected media is not an image')
  }

  const tempFilePath = file.tempFilePath?.trim()

  if (!tempFilePath) {
    throw new Error('Selected image has no temp path')
  }

  const imageInfo = await getImageInfo(tempFilePath)
  const detectedType = imageInfo.type?.toLowerCase()
  const inferredType = getImageTypeFromPath(imageInfo.path || tempFilePath)
  const imageType = detectedType || inferredType
  const mimeType = imageType ? SUPPORTED_IMAGE_TYPES[imageType] : undefined

  if (!mimeType) {
    throw new Error('Unsupported image type')
  }

  if (!Number.isFinite(imageInfo.width) || !Number.isFinite(imageInfo.height)) {
    throw new Error('Invalid image dimensions')
  }

  return {
    tempFilePath,
    width: imageInfo.width,
    height: imageInfo.height,
    mimeType,
  }
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
  async handleUploadTap(this: any) {
    if (this.isChoosingImage) {
      return
    }

    this.isChoosingImage = true

    try {
      const selectedFile = await chooseSingleImage()
      const image = await validateSelectedImage(selectedFile)

      updateImagePreviewState({
        reference: {
          tempFilePath: image.tempFilePath,
        },
        metadata: {
          width: image.width,
          height: image.height,
          mimeType: image.mimeType,
        },
      })

      wx.navigateTo({
        url: '/pages/image-preview/index',
      })
    } catch (error) {
      const message = getErrorMessage(error)

      if (!message.includes('cancel')) {
        wx.showToast({
          icon: 'none',
          title: '\u65e0\u6cd5\u8bfb\u53d6\u8fd9\u5f20\u56fe\u7247',
        })
      }
    } finally {
      this.isChoosingImage = false
    }
  },
})
