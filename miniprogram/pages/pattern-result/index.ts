import type {
  BeadPatternResult,
  Brand,
  CompositionAdjustment,
  CompositionHorizontal,
  CompositionScale,
  CompositionVertical,
  GenerationOptionType,
} from '../../models/generation-session'
import { DEFAULT_COMPOSITION_ADJUSTMENT } from '../../models/generation-session'
import { getGenerationSessionState } from '../../stores/generation-session-store'

type BeadTone = 'empty' | 'pink' | 'yellow' | 'surface' | 'soft' | 'ink'

interface PatternPreviewCell {
  readonly key: number
  readonly tone: BeadTone
  readonly symbol?: string
}

interface PatternPreviewRow {
  readonly key: number
  readonly cells: readonly PatternPreviewCell[]
}

interface PatternPreviewDisplay {
  readonly optionType: GenerationOptionType
  readonly optionLabel: string
  readonly sizeLabel: string
  readonly compositionSummary: string
  readonly rows: readonly PatternPreviewRow[]
}

const OPTION_LABELS: Record<GenerationOptionType, string> = {
  full: '\u5b8c\u6574\u56fe\u6848',
  subject_focused: '\u4e3b\u4f53\u7a81\u51fa',
  background_removed: '\u53bb\u9664\u80cc\u666f',
}

const BRAND_LABELS: Record<Brand, string> = {
  mard: 'MARD',
}

const DEVELOPMENT_FIXTURE_SIZE = 11
const DEVELOPMENT_FIXTURE_CENTER = Math.floor(DEVELOPMENT_FIXTURE_SIZE / 2)
const DEVELOPMENT_FIXTURE_DISPLAY_WIDTH = 29
const DEVELOPMENT_FIXTURE_DISPLAY_HEIGHT = 29

const COMPOSITION_COLUMN_OFFSET: Record<CompositionHorizontal, number> = {
  left: -2,
  center: 0,
  right: 2,
}

const COMPOSITION_ROW_OFFSET: Record<CompositionVertical, number> = {
  top: -2,
  center: 0,
  bottom: 2,
}

const COMPOSITION_SCALE_RADIUS: Record<CompositionScale, number> = {
  small: 1,
  medium: 2,
  large: 3,
}

const POSITION_LABELS = {
  horizontal: {
    left: '\u5de6',
    center: '\u5c45\u4e2d',
    right: '\u53f3',
  },
  vertical: {
    top: '\u4e0a',
    center: '\u5c45\u4e2d',
    bottom: '\u4e0b',
  },
  scale: {
    small: '\u8f83\u5c0f',
    medium: '\u9002\u4e2d',
    large: '\u8f83\u5927',
  },
} as const

const COLOR_CODE_DISPLAY_MAP: Record<string, BeadTone> = {
  'MARD-A01': 'surface',
  'MARD-A02': 'soft',
  'MARD-B01': 'yellow',
  'MARD-B02': 'ink',
  'MARD-B12': 'yellow',
  'MARD-P01': 'pink',
  'MARD-P02': 'soft',
  'MARD-G07': 'ink',
}

function cloneCompositionAdjustment(
  adjustment?: CompositionAdjustment,
): CompositionAdjustment {
  return {
    ...(adjustment ?? DEFAULT_COMPOSITION_ADJUSTMENT),
  }
}

function getCompositionCenter(adjustment: CompositionAdjustment) {
  return {
    row: DEVELOPMENT_FIXTURE_CENTER + COMPOSITION_ROW_OFFSET[adjustment.vertical],
    column:
      DEVELOPMENT_FIXTURE_CENTER +
      COMPOSITION_COLUMN_OFFSET[adjustment.horizontal],
  }
}

function getCompositionSummary(adjustment: CompositionAdjustment): string {
  let positionLabel: string = POSITION_LABELS.horizontal[adjustment.horizontal]

  if (
    adjustment.horizontal === 'center' &&
    adjustment.vertical === 'center'
  ) {
    positionLabel = '\u5c45\u4e2d'
  } else if (adjustment.horizontal === 'center') {
    positionLabel = `\u5c45${POSITION_LABELS.vertical[adjustment.vertical]}`
  } else if (adjustment.vertical === 'center') {
    positionLabel = `\u5c45${POSITION_LABELS.horizontal[adjustment.horizontal]}`
  } else {
    positionLabel = `${POSITION_LABELS.horizontal[adjustment.horizontal]}${
      POSITION_LABELS.vertical[adjustment.vertical]
    }`
  }

  return `${positionLabel} \u00b7 ${POSITION_LABELS.scale[adjustment.scale]}`
}

function getToneForColorCode(colorCode: string | null): BeadTone {
  if (!colorCode) {
    return 'empty'
  }

  return COLOR_CODE_DISPLAY_MAP[colorCode] ?? 'soft'
}

function getSymbolForColorCode(colorCode: string | null): string {
  const codeSuffix = colorCode?.split('-').pop()

  return codeSuffix?.replace(/[^A-Z0-9]/g, '').slice(-2) ?? ''
}

function createPreviewCell(
  key: number,
  colorCode: string | null,
): PatternPreviewCell {
  const symbol = getSymbolForColorCode(colorCode)

  return symbol
    ? {
        key,
        tone: getToneForColorCode(colorCode),
        symbol,
      }
    : {
        key,
        tone: getToneForColorCode(colorCode),
      }
}

function mapPatternResultToPreviewRows(
  patternResult: BeadPatternResult,
): readonly PatternPreviewRow[] {
  return Array.from({ length: patternResult.height }, (_, rowIndex) => ({
    key: rowIndex,
    cells: Array.from({ length: patternResult.width }, (_, columnIndex) => {
      const cellIndex = rowIndex * patternResult.width + columnIndex
      const colorCode = patternResult.cells[cellIndex]?.colorCode ?? null

      return createPreviewCell(cellIndex, colorCode)
    }),
  }))
}

function getDevelopmentFixtureColorCode(
  optionType: GenerationOptionType,
  adjustment: CompositionAdjustment,
  rowIndex: number,
  columnIndex: number,
): string | null {
  const center = getCompositionCenter(adjustment)
  const subjectRadius = COMPOSITION_SCALE_RADIUS[adjustment.scale]
  const rowDistance = Math.abs(rowIndex - center.row)
  const columnDistance = Math.abs(columnIndex - center.column)
  const distance = rowDistance + columnDistance

  if (optionType === 'subject_focused') {
    if (rowDistance <= subjectRadius && columnDistance <= subjectRadius) {
      return distance % 2 === 0 ? 'MARD-P01' : 'MARD-B12'
    }

    if (
      rowDistance <= subjectRadius + 2 &&
      columnDistance <= subjectRadius + 1
    ) {
      return 'MARD-P02'
    }

    return null
  }

  if (optionType === 'background_removed') {
    if (
      rowDistance <= subjectRadius + 1 &&
      columnDistance <= subjectRadius
    ) {
      return rowIndex <= center.row ? 'MARD-P01' : 'MARD-B12'
    }

    return null
  }

  if ((rowIndex + columnIndex) % 7 === 0) {
    return 'MARD-B12'
  }

  if (
    rowDistance <= subjectRadius + 1 &&
    columnDistance <= subjectRadius + 2
  ) {
    return (rowIndex + columnIndex) % 2 === 0 ? 'MARD-P01' : 'MARD-P02'
  }

  return (rowIndex + columnIndex) % 4 === 0 ? 'MARD-A01' : null
}

function buildDevelopmentFixtureRows(
  optionType: GenerationOptionType,
  adjustment: CompositionAdjustment,
): readonly PatternPreviewRow[] {
  return Array.from({ length: DEVELOPMENT_FIXTURE_SIZE }, (_, rowIndex) => ({
    key: rowIndex,
    cells: Array.from({ length: DEVELOPMENT_FIXTURE_SIZE }, (_, columnIndex) => {
      const colorCode = getDevelopmentFixtureColorCode(
        optionType,
        adjustment,
        rowIndex,
        columnIndex,
      )

      return createPreviewCell(
        rowIndex * DEVELOPMENT_FIXTURE_SIZE + columnIndex,
        colorCode,
      )
    }),
  }))
}

function getSizeLabel(width: number, height: number): string {
  return `${width} \u00d7 ${height}`
}

function resolveCommittedPatternResult() {
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

  const compositionAdjustment = cloneCompositionAdjustment(
    session.compositionAdjustment,
  )
  const compositionSummary = getCompositionSummary(compositionAdjustment)
  const patternResult = session.patternResult

  const preview: PatternPreviewDisplay = patternResult
    ? {
        optionType: selectedOptionType,
        optionLabel: OPTION_LABELS[selectedOptionType],
        sizeLabel: getSizeLabel(patternResult.width, patternResult.height),
        compositionSummary,
        rows: mapPatternResultToPreviewRows(patternResult),
      }
    : {
        optionType: selectedOptionType,
        optionLabel: OPTION_LABELS[selectedOptionType],
        sizeLabel: getSizeLabel(
          DEVELOPMENT_FIXTURE_DISPLAY_WIDTH,
          DEVELOPMENT_FIXTURE_DISPLAY_HEIGHT,
        ),
        compositionSummary,
        rows: buildDevelopmentFixtureRows(
          selectedOptionType,
          compositionAdjustment,
        ),
      }

  return {
    preview,
    brandLabel: BRAND_LABELS[session.settings.brand],
    sessionRevision: session.revision,
  }
}

Page({
  data: {
    hasValidPattern: false,
    preview: undefined as PatternPreviewDisplay | undefined,
    brandLabel: '',
    isPreviewOpen: false,
  },
  onLoad(this: any) {
    this.refreshPatternResult()
  },
  onShow(this: any) {
    this.refreshPatternResult()
  },
  refreshPatternResult(this: any) {
    const result = resolveCommittedPatternResult()

    if (!result) {
      this.previewSessionRevision = undefined
      this.setData({
        hasValidPattern: false,
        preview: undefined,
        brandLabel: '',
        isPreviewOpen: false,
      })
      return
    }

    if (
      this.data.hasValidPattern &&
      this.data.preview &&
      this.previewSessionRevision === result.sessionRevision
    ) {
      return
    }

    this.previewSessionRevision = result.sessionRevision

    this.setData({
      hasValidPattern: true,
      preview: result.preview,
      brandLabel: result.brandLabel,
    })
  },
  handleBack() {
    wx.navigateBack()
  },
  handlePreviewTap(this: any) {
    if (!this.data.hasValidPattern) {
      return
    }

    this.setData({
      isPreviewOpen: true,
    })
  },
  handlePreviewClose(this: any) {
    this.setData({
      isPreviewOpen: false,
    })
  },
  handleReselect() {
    wx.navigateBack({
      delta: 2,
    })
  },
  handleReturnToOptions() {
    wx.redirectTo({
      url: '/pages/generation-options/index',
    })
  },
  handleSave(this: any) {
    if (!this.data.hasValidPattern) {
      return
    }

    console.log('save pattern placeholder')
  },
})
