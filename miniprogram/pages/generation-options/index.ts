import type {
  GenerationOptionStatus,
  GenerationOptionType,
} from '../../models/generation-session'
import {
  getGenerationSessionState,
  selectGenerationOption,
  updateGenerationOptions,
} from '../../stores/generation-session-store'

type PreviewTone = 'full' | 'subject' | 'background'

interface PagePreviewOption {
  readonly type: GenerationOptionType
  readonly label: string
  readonly description: string
  readonly status: GenerationOptionStatus
  readonly statusLabel: string
  readonly recommended: boolean
  readonly selectable: boolean
  readonly previewTone: PreviewTone
  readonly errorMessage?: string
}

const PAGE_PREVIEW_OPTIONS: readonly PagePreviewOption[] = [
  {
    type: 'full',
    label: '完整构图',
    description: '保留图片整体氛围',
    status: 'success',
    statusLabel: '可选择',
    recommended: false,
    selectable: true,
    previewTone: 'full',
  },
  {
    type: 'subject_focused',
    label: '主体突出',
    description: '更突出人物或主体',
    status: 'success',
    statusLabel: '可选择',
    recommended: true,
    selectable: true,
    previewTone: 'subject',
  },
  {
    type: 'background_removed',
    label: '纯净背景',
    description: '去除复杂背景，更简洁',
    status: 'failed',
    statusLabel: '生成失败',
    recommended: false,
    selectable: false,
    previewTone: 'background',
    errorMessage: '该方案暂不可选择，可查看其他可用方案。',
  },
]

function findOption(
  options: readonly PagePreviewOption[],
  type?: GenerationOptionType,
): PagePreviewOption | undefined {
  return options.find((option) => option.type === type)
}

function findDefaultSelectedOption(
  options: readonly PagePreviewOption[],
): PagePreviewOption | undefined {
  return (
    options.find(
      (option) =>
        option.recommended &&
        option.status === 'success' &&
        option.selectable,
    ) ??
    options.find(
      (option) => option.status === 'success' && option.selectable,
    )
  )
}

function buildGenerationOptionSlots(
  options: readonly PagePreviewOption[],
) {
  return options.map((option) => ({
    type: option.type,
    status: option.status,
    errorMessage: option.errorMessage,
    recommended: option.recommended,
    selectable: option.selectable,
  }))
}

function findCommittedSelectableOption() {
  const session = getGenerationSessionState()
  const selectedOptionType = session.selectedOption.optionType

  if (!selectedOptionType) {
    return undefined
  }

  return session.options.find(
    (option) =>
      option.type === selectedOptionType &&
      option.status === 'success' &&
      option.selectable !== false,
  )
}

Page({
  data: {
    options: PAGE_PREVIEW_OPTIONS,
    selectedOptionType: '',
    previewOptionType: '',
    heroOption: findDefaultSelectedOption(PAGE_PREVIEW_OPTIONS),
    isPreviewing: false,
    canContinue: false,
    showRegenerationDialog: false,
    regenerationRemainingPreviewCount: 4,
  },
  onShow(this: any) {
    const committedOption = findCommittedSelectableOption()

    if (!committedOption) {
      return
    }

    this.setData({
      selectedOptionType: committedOption.type,
      previewOptionType: '',
    })
    this.syncHeroOption()
  },
  handleBack() {
    wx.navigateBack()
  },
  syncHeroOption(this: any) {
    const options = this.data.options as readonly PagePreviewOption[]
    const previewOption = findOption(
      options,
      this.data.previewOptionType as GenerationOptionType | undefined,
    )
    const selectedOption = findOption(
      options,
      this.data.selectedOptionType as GenerationOptionType | undefined,
    )
    const heroOption =
      previewOption ?? selectedOption ?? findDefaultSelectedOption(options)
    const canContinue = Boolean(
      selectedOption &&
        selectedOption.status === 'success' &&
        selectedOption.selectable,
    )

    this.setData({
      heroOption,
      isPreviewing: Boolean(previewOption),
      canContinue,
    })
  },
  onOptionTap(this: any, event: WechatMiniprogram.TouchEvent) {
    const option = findOption(
      this.data.options,
      event.currentTarget.dataset.type as GenerationOptionType,
    )

    if (!option || option.status !== 'success' || !option.selectable) {
      return
    }

    updateGenerationOptions(buildGenerationOptionSlots(this.data.options))
    selectGenerationOption(option.type)

    this.setData({
      selectedOptionType: option.type,
      previewOptionType: '',
    })
    this.syncHeroOption()
  },
  onOptionLongPress(this: any, event: WechatMiniprogram.TouchEvent) {
    const option = findOption(
      this.data.options,
      event.currentTarget.dataset.type as GenerationOptionType,
    )

    if (!option || option.status !== 'success' || !option.selectable) {
      return
    }

    this.setData({
      previewOptionType: option.type,
    })
    this.syncHeroOption()
  },
  onOptionTouchEnd(this: any) {
    if (!this.data.previewOptionType) {
      return
    }

    this.setData({
      previewOptionType: '',
    })
    this.syncHeroOption()
  },
  onOptionTouchCancel(this: any) {
    if (!this.data.previewOptionType) {
      return
    }

    this.setData({
      previewOptionType: '',
    })
    this.syncHeroOption()
  },
  handleRegenerateTap(this: any) {
    this.setData({
      showRegenerationDialog: true,
    })
  },
  handleRegenerationCancel(this: any) {
    this.setData({
      showRegenerationDialog: false,
    })
  },
  handleRegenerationConfirm(this: any) {
    console.log('Regeneration confirmation placeholder')
    this.setData({
      showRegenerationDialog: false,
    })
  },
  handleNext(this: any) {
    const committedOption = findCommittedSelectableOption()

    if (!this.data.canContinue || !committedOption) {
      wx.showToast({
        title: '请先选择可用方案',
        icon: 'none',
      })
      return
    }

    wx.navigateTo({
      url: '/pages/composition-adjustment/index',
    })
  },
})
