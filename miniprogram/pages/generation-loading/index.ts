import type {
  GenerationLifecycleStatus,
  GenerationStep,
} from '../../models/generation-session'
import { getGenerationSessionState } from '../../stores/generation-session-store'

interface StepPresentation {
  readonly label: string
  readonly supportingText: string
}

const STEP_PRESENTATION: Record<GenerationStep, StepPresentation> = {
  image_analysis: {
    label: '正在观察图片',
    supportingText: '我们会先理解图片里的主要内容，再为拼豆图纸做准备。',
  },
  composition: {
    label: '正在设计拼豆布局',
    supportingText: '系统会把画面整理成适合豆板的构图。',
  },
  palette_matching: {
    label: '正在匹配拼豆颜色',
    supportingText: '颜色会根据所选品牌与豆板尺寸进行适配。',
  },
  complete: {
    label: '准备完成',
    supportingText: '图纸方案准备完成后会进入方案选择。',
  },
}

const STATUS_COPY: Record<GenerationLifecycleStatus, string> = {
  idle: '等待开始生成',
  preparing: '正在准备生成',
  processing: '正在生成图纸',
  partial_success: '部分方案已完成',
  success: '生成已完成',
  failed: '生成遇到问题',
  timeout: '生成时间较长',
}

Page({
  data: {
    lifecycleStatus: 'preparing' as GenerationLifecycleStatus,
    currentGenerationStep: 'image_analysis' as GenerationStep,
    currentStepLabel: STEP_PRESENTATION.image_analysis.label,
    currentStatusText: STATUS_COPY.preparing,
    supportingText: STEP_PRESENTATION.image_analysis.supportingText,
    tipText: '主体清晰的图片通常更容易生成好看的图纸',
    animationCells: [
      { key: 'cell-01', tone: 0 },
      { key: 'cell-02', tone: 1 },
      { key: 'cell-03', tone: 2 },
      { key: 'cell-04', tone: 3 },
      { key: 'cell-05', tone: 1 },
      { key: 'cell-06', tone: 2 },
      { key: 'cell-07', tone: 3 },
      { key: 'cell-08', tone: 0 },
      { key: 'cell-09', tone: 2 },
      { key: 'cell-10', tone: 3 },
      { key: 'cell-11', tone: 0 },
      { key: 'cell-12', tone: 1 },
      { key: 'cell-13', tone: 3 },
      { key: 'cell-14', tone: 0 },
      { key: 'cell-15', tone: 1 },
      { key: 'cell-16', tone: 2 },
    ],
  },
  onLoad(this: any) {
    this.syncSessionState()
  },
  onShow(this: any) {
    this.syncSessionState()
  },
  syncSessionState(this: any) {
    const session = getGenerationSessionState()
    const currentStep = session.currentGenerationStep
    const lifecycleStatus = session.generationLifecycleStatus
    const presentation = STEP_PRESENTATION[currentStep]

    this.setData({
      lifecycleStatus,
      currentGenerationStep: currentStep,
      currentStepLabel: presentation.label,
      currentStatusText: STATUS_COPY[lifecycleStatus],
      supportingText: presentation.supportingText,
    })
  },
  handleBack() {
    wx.navigateBack()
  },
})
