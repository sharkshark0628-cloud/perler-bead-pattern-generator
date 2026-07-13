import type {
  BoardSize,
  Brand,
  Difficulty,
} from '../../models/generation-session'
import {
  prepareGeneration,
  updateGenerationSettings,
} from '../../stores/generation-session-store'

type BoardSizeValue = BoardSize
type DifficultyValue = Difficulty
type BrandValue = Brand

interface SettingsOption<TValue extends string> {
  value: TValue
  label: string
  description?: string
}

Page({
  data: {
    selectedBoardSize: '78x78' as BoardSizeValue,
    selectedDifficulty: 'standard' as DifficultyValue,
    selectedBrand: 'mard' as BrandValue,
    boardSizeOptions: [
      { value: '52x52', label: '52×52' },
      { value: '78x78', label: '78×78' },
      { value: '104x104', label: '104×104' },
    ] as SettingsOption<BoardSizeValue>[],
    difficultyOptions: [
      {
        value: 'simple',
        label: '简单',
        description: '颜色更少，更容易制作',
      },
      {
        value: 'standard',
        label: '标准',
        description: '平衡细节与制作难度',
      },
      {
        value: 'detailed',
        label: '详细',
        description: '颜色更丰富，保留更多细节',
      },
    ] as SettingsOption<DifficultyValue>[],
    aiProcessingItems: [
      { label: '主体识别' },
      { label: '智能构图' },
      { label: '背景处理' },
      { label: '颜色匹配' },
      { label: '安全边距' },
    ],
  },
  handleBack() {
    wx.navigateBack()
  },
  handleBoardSizeSelect(this: any, event: WechatMiniprogram.TouchEvent) {
    const value = event.currentTarget.dataset.value as BoardSizeValue

    this.setData({
      selectedBoardSize: value,
    })
  },
  handleDifficultySelect(this: any, event: WechatMiniprogram.TouchEvent) {
    const value = event.currentTarget.dataset.value as DifficultyValue

    this.setData({
      selectedDifficulty: value,
    })
  },
  handleBrandTap() {
    console.log('MARD is the only brand option for the MVP')
  },
  handleStart(this: any) {
    updateGenerationSettings({
      boardSize: this.data.selectedBoardSize as BoardSize,
      difficulty: this.data.selectedDifficulty as Difficulty,
      brand: this.data.selectedBrand as Brand,
    })
    prepareGeneration()

    wx.navigateTo({
      url: '/pages/generation-loading/index',
    })
  },
})
