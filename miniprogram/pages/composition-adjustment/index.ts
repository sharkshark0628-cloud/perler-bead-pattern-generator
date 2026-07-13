import type {
  BoardSize,
  Brand,
  CompositionAdjustment,
  CompositionHorizontal,
  CompositionScale,
  CompositionVertical,
  GenerationOptionType,
} from '../../models/generation-session'
import { DEFAULT_COMPOSITION_ADJUSTMENT } from '../../models/generation-session'
import {
  getGenerationSessionState,
  updateCompositionAdjustment,
  updatePatternResult,
} from '../../stores/generation-session-store'
import { generateLocalPattern } from '../../services/generation/local-pattern-generator'
import { handoffGenerationResult } from '../../services/generation/generation-pipeline'

type PreviewTone = 'full' | 'subject' | 'background'
type AdjustmentKey = keyof CompositionAdjustment
type AdjustmentValue =
  | CompositionHorizontal
  | CompositionVertical
  | CompositionScale

interface AdjustmentChoice {
  readonly value: AdjustmentValue
  readonly label: string
}

interface AdjustmentGroup {
  readonly key: AdjustmentKey
  readonly label: string
  readonly choices: readonly AdjustmentChoice[]
}

interface CompositionPreviewFixture {
  readonly optionType: GenerationOptionType
  readonly optionLabel: string
  readonly previewTone: PreviewTone
}

interface BoardDimensions {
  readonly width: number
  readonly height: number
}

const OPTION_LABELS: Record<GenerationOptionType, string> = {
  full: '\u5b8c\u6574\u6784\u56fe',
  subject_focused: '\u4e3b\u4f53\u7a81\u51fa',
  background_removed: '\u53bb\u9664\u80cc\u666f',
}

const PREVIEW_TONES: Record<GenerationOptionType, PreviewTone> = {
  full: 'full',
  subject_focused: 'subject',
  background_removed: 'background',
}

const BOARD_DIMENSIONS: Record<BoardSize, BoardDimensions> = {
  '52x52': { width: 52, height: 52 },
  '78x78': { width: 78, height: 78 },
  '104x104': { width: 104, height: 104 },
}

const SUPPORTED_BRANDS: readonly Brand[] = ['mard']

const SELECT_OPTION_FAILURE_TOAST =
  '\u8bf7\u5148\u9009\u62e9\u53ef\u7528\u65b9\u6848'
const GENERATOR_FAILURE_TOAST =
  '\u6682\u65f6\u65e0\u6cd5\u751f\u6210\u56fe\u7eb8\uff0c\u8bf7\u68c0\u67e5\u8bbe\u7f6e'
const HANDOFF_FAILURE_TOAST =
  '\u56fe\u7eb8\u751f\u6210\u5931\u8d25\uff0c\u8bf7\u91cd\u65b0\u5c1d\u8bd5'
const GENERATION_LOADING_LABEL = '\u6b63\u5728\u751f\u6210'

const ADJUSTMENT_GROUPS: readonly AdjustmentGroup[] = [
  {
    key: 'horizontal',
    label: '\u5de6\u53f3\u4f4d\u7f6e',
    choices: [
      { value: 'left', label: '\u9760\u5de6' },
      { value: 'center', label: '\u5c45\u4e2d' },
      { value: 'right', label: '\u9760\u53f3' },
    ],
  },
  {
    key: 'vertical',
    label: '\u4e0a\u4e0b\u4f4d\u7f6e',
    choices: [
      { value: 'top', label: '\u9760\u4e0a' },
      { value: 'center', label: '\u5c45\u4e2d' },
      { value: 'bottom', label: '\u9760\u4e0b' },
    ],
  },
  {
    key: 'scale',
    label: '\u4e3b\u4f53\u5927\u5c0f',
    choices: [
      { value: 'small', label: '\u8f83\u5c0f' },
      { value: 'medium', label: '\u9002\u4e2d' },
      { value: 'large', label: '\u8f83\u5927' },
    ],
  },
]

function resolveCommittedOption() {
  const session = getGenerationSessionState()
  const selectedOptionType = session.selectedOption.optionType

  if (!selectedOptionType) {
    return undefined
  }

  const selectedOption = session.options.find(
    (option) =>
      option.type === selectedOptionType &&
      option.status === 'success' &&
      option.selectable !== false,
  )

  if (!selectedOption) {
    return undefined
  }

  return {
    fixture: {
      optionType: selectedOptionType,
      optionLabel: OPTION_LABELS[selectedOptionType],
      previewTone: PREVIEW_TONES[selectedOptionType],
    } as CompositionPreviewFixture,
    compositionAdjustment:
      session.compositionAdjustment ?? DEFAULT_COMPOSITION_ADJUSTMENT,
  }
}

function showGenerationFailure(title: string): void {
  wx.showToast({
    title,
    icon: 'none',
  })
}

function resolveBoardDimensions(boardSize: unknown): BoardDimensions | undefined {
  return BOARD_DIMENSIONS[boardSize as BoardSize]
}

function isSupportedBrand(brand: unknown): brand is Brand {
  return SUPPORTED_BRANDS.includes(brand as Brand)
}

Page({
  data: {
    hasValidOption: false,
    fixture: undefined as CompositionPreviewFixture | undefined,
    adjustment: { ...DEFAULT_COMPOSITION_ADJUSTMENT },
    adjustmentGroups: ADJUSTMENT_GROUPS,
    isGenerating: false,
    generationLoadingLabel: GENERATION_LOADING_LABEL,
  },
  onLoad(this: any) {
    this.refreshCompositionState()
  },
  onShow(this: any) {
    this.refreshCompositionState()
  },
  refreshCompositionState(this: any) {
    const result = resolveCommittedOption()

    if (!result) {
      this.setData({
        hasValidOption: false,
        fixture: undefined,
        adjustment: { ...DEFAULT_COMPOSITION_ADJUSTMENT },
      })
      return
    }

    this.setData({
      hasValidOption: true,
      fixture: result.fixture,
      adjustment: { ...result.compositionAdjustment },
    })
  },
  handleBack() {
    wx.navigateBack()
  },
  handleAdjustmentSelect(this: any, event: WechatMiniprogram.TouchEvent) {
    const key = event.currentTarget.dataset.key as AdjustmentKey
    const value = event.currentTarget.dataset.value as AdjustmentValue

    if (!key || !value) {
      return
    }

    this.setData({
      adjustment: {
        ...this.data.adjustment,
        [key]: value,
      },
    })
  },
  commitCompositionAdjustment(this: any) {
    return updateCompositionAdjustment(
      this.data.adjustment as CompositionAdjustment,
    )
  },
  handleReselect(this: any) {
    if (this.data.hasValidOption) {
      this.commitCompositionAdjustment()
    }

    wx.navigateBack()
  },
  handleReturnToOptions() {
    wx.redirectTo({
      url: '/pages/generation-options/index',
    })
  },
  handleGeneratePattern(this: any) {
    if (this.data.isGenerating) {
      return
    }

    this.setData({ isGenerating: true })

    const result = resolveCommittedOption()

    if (!result) {
      this.setData({ isGenerating: false })
      showGenerationFailure(SELECT_OPTION_FAILURE_TOAST)
      return
    }

    const committedSession = this.commitCompositionAdjustment()
    const dimensions = resolveBoardDimensions(committedSession.settings.boardSize)
    const brand = committedSession.settings.brand

    if (!dimensions || !isSupportedBrand(brand)) {
      this.setData({ isGenerating: false })
      showGenerationFailure(GENERATOR_FAILURE_TOAST)
      return
    }

    updatePatternResult(undefined)

    const generationResult = generateLocalPattern({
      optionType: result.fixture.optionType,
      compositionAdjustment: committedSession.compositionAdjustment,
      width: dimensions.width,
      height: dimensions.height,
      brand,
    })

    if (!generationResult.success) {
      console.log('Local pattern generation failed', generationResult.errorCode)
      this.setData({ isGenerating: false })
      showGenerationFailure(GENERATOR_FAILURE_TOAST)
      return
    }

    const handoffResult = handoffGenerationResult(generationResult.rawResult)

    if (!handoffResult.success) {
      console.log('Pattern handoff failed', handoffResult.errorCode)
      this.setData({ isGenerating: false })
      showGenerationFailure(HANDOFF_FAILURE_TOAST)
      return
    }

    this.setData({ isGenerating: false })

    wx.navigateTo({
      url: '/pages/pattern-result/index',
    })
  },
})
