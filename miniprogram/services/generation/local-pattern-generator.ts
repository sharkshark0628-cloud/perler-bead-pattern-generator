import type {
  Brand,
  CompositionAdjustment,
  CompositionHorizontal,
  CompositionScale,
  CompositionVertical,
  GenerationOptionType,
} from '../../models/generation-session'
import type {
  RawGenerationPatternCell,
  RawGenerationPatternResult,
} from './result-adapter'

export interface LocalPatternGenerationInput {
  readonly optionType: GenerationOptionType
  readonly compositionAdjustment: CompositionAdjustment
  readonly width: number
  readonly height: number
  readonly brand: Brand
}

export type LocalPatternGenerationErrorCode =
  | 'invalid_dimensions'
  | 'invalid_option'
  | 'invalid_composition'
  | 'invalid_brand'

export type LocalPatternGenerationResult =
  | {
      readonly success: true
      readonly rawResult: RawGenerationPatternResult
    }
  | {
      readonly success: false
      readonly errorCode: LocalPatternGenerationErrorCode
    }

const OPTION_TYPES: readonly GenerationOptionType[] = [
  'full',
  'subject_focused',
  'background_removed',
]

const HORIZONTAL_VALUES: readonly CompositionHorizontal[] = [
  'left',
  'center',
  'right',
]

const VERTICAL_VALUES: readonly CompositionVertical[] = [
  'top',
  'center',
  'bottom',
]

const SCALE_VALUES: readonly CompositionScale[] = ['small', 'medium', 'large']
const BRAND_VALUES: readonly Brand[] = ['mard']

const COLOR_IDS = {
  primary: 'A01',
  secondary: 'A02',
  accent: 'B01',
  outline: 'B02',
} as const

function isFinitePositiveInteger(value: unknown): value is number {
  return Number.isFinite(value) && Number.isInteger(value) && Number(value) > 0
}

function isGenerationOptionType(
  value: unknown,
): value is GenerationOptionType {
  return OPTION_TYPES.includes(value as GenerationOptionType)
}

function isCompositionHorizontal(
  value: unknown,
): value is CompositionHorizontal {
  return HORIZONTAL_VALUES.includes(value as CompositionHorizontal)
}

function isCompositionVertical(value: unknown): value is CompositionVertical {
  return VERTICAL_VALUES.includes(value as CompositionVertical)
}

function isCompositionScale(value: unknown): value is CompositionScale {
  return SCALE_VALUES.includes(value as CompositionScale)
}

function isBrand(value: unknown): value is Brand {
  return BRAND_VALUES.includes(value as Brand)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isValidComposition(compositionAdjustment: unknown): boolean {
  if (!isRecord(compositionAdjustment)) {
    return false
  }

  return (
    isCompositionHorizontal(compositionAdjustment.horizontal) &&
    isCompositionVertical(compositionAdjustment.vertical) &&
    isCompositionScale(compositionAdjustment.scale)
  )
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function resolveAxisPosition(
  size: number,
  alignment: CompositionHorizontal | CompositionVertical,
): number {
  if (alignment === 'left' || alignment === 'top') {
    return Math.floor((size - 1) * 0.3)
  }

  if (alignment === 'right' || alignment === 'bottom') {
    return Math.ceil((size - 1) * 0.7)
  }

  return Math.floor((size - 1) / 2)
}

function resolveBaseRadius(
  minDimension: number,
  scale: CompositionScale,
): number {
  const divisorByScale: Record<CompositionScale, number> = {
    small: 8,
    medium: 6,
    large: 4,
  }

  return Math.max(1, Math.floor(minDimension / divisorByScale[scale]))
}

function resolveSubjectRadius(
  minDimension: number,
  optionType: GenerationOptionType,
  scale: CompositionScale,
): number {
  const baseRadius = resolveBaseRadius(minDimension, scale)

  if (optionType === 'subject_focused') {
    return baseRadius + 1
  }

  if (optionType === 'background_removed') {
    return Math.max(1, baseRadius - 1)
  }

  return baseRadius
}

function getColorCode(brand: Brand, colorId: string): string {
  return `${brand.toUpperCase()}-${colorId}`
}

function getCellIndex(width: number, row: number, column: number): number {
  // Raw cells are row-major: index = row * width + column.
  return row * width + column
}

function createEmptyCells(size: number): RawGenerationPatternCell[] {
  return Array.from({ length: size }, () => ({ colorCode: null }))
}

function writeCell(
  cells: RawGenerationPatternCell[],
  width: number,
  height: number,
  row: number,
  column: number,
  colorCode: string,
): void {
  if (row < 0 || row >= height || column < 0 || column >= width) {
    return
  }

  cells[getCellIndex(width, row, column)] = { colorCode }
}

function paintSubjectMotif(input: {
  readonly cells: RawGenerationPatternCell[]
  readonly width: number
  readonly height: number
  readonly centerRow: number
  readonly centerColumn: number
  readonly radius: number
  readonly optionType: GenerationOptionType
  readonly brand: Brand
}): void {
  const {
    cells,
    width,
    height,
    centerRow,
    centerColumn,
    radius,
    optionType,
    brand,
  } = input
  const primary = getColorCode(brand, COLOR_IDS.primary)
  const secondary = getColorCode(brand, COLOR_IDS.secondary)
  const outline = getColorCode(brand, COLOR_IDS.outline)

  for (
    let row = centerRow - radius - 1;
    row <= centerRow + radius + 1;
    row += 1
  ) {
    for (
      let column = centerColumn - radius - 1;
      column <= centerColumn + radius + 1;
      column += 1
    ) {
      const rowDistance = Math.abs(row - centerRow)
      const columnDistance = Math.abs(column - centerColumn)
      const manhattanDistance = rowDistance + columnDistance

      if (manhattanDistance > radius + 1) {
        continue
      }

      if (manhattanDistance === radius + 1) {
        writeCell(cells, width, height, row, column, outline)
        continue
      }

      const isAccentCell =
        optionType === 'subject_focused'
          ? rowDistance <= 1 && columnDistance <= radius
          : (row + column + radius) % 3 === 0

      writeCell(
        cells,
        width,
        height,
        row,
        column,
        isAccentCell ? secondary : primary,
      )
    }
  }
}

function paintFullOptionAccents(input: {
  readonly cells: RawGenerationPatternCell[]
  readonly width: number
  readonly height: number
  readonly centerRow: number
  readonly centerColumn: number
  readonly radius: number
  readonly brand: Brand
}): void {
  const { cells, width, height, centerRow, centerColumn, radius, brand } = input
  const accent = getColorCode(brand, COLOR_IDS.accent)
  const stride = Math.max(3, Math.floor(Math.min(width, height) / 5))

  for (let row = 1; row < height; row += stride) {
    const column = (row * 2 + stride) % width
    const distanceFromSubject =
      Math.abs(row - centerRow) + Math.abs(column - centerColumn)

    if (distanceFromSubject > radius + 2) {
      writeCell(cells, width, height, row, column, accent)
    }
  }
}

function createRawPatternResult(
  input: LocalPatternGenerationInput,
): RawGenerationPatternResult {
  const { optionType, compositionAdjustment, width, height, brand } = input
  const cellCount = width * height
  const cells = createEmptyCells(cellCount)
  const minDimension = Math.min(width, height)
  const radius = resolveSubjectRadius(
    minDimension,
    optionType,
    compositionAdjustment.scale,
  )
  const centerColumn = clamp(
    resolveAxisPosition(width, compositionAdjustment.horizontal),
    0,
    width - 1,
  )
  const centerRow = clamp(
    resolveAxisPosition(height, compositionAdjustment.vertical),
    0,
    height - 1,
  )

  if (optionType === 'full') {
    paintFullOptionAccents({
      cells,
      width,
      height,
      centerRow,
      centerColumn,
      radius,
      brand,
    })
  }

  paintSubjectMotif({
    cells,
    width,
    height,
    centerRow,
    centerColumn,
    radius,
    optionType,
    brand,
  })

  return {
    width,
    height,
    cells,
  }
}

// Deterministic local/reference generator: no Store, page, adapter, or provider side effects.
export function generateLocalPattern(
  input: LocalPatternGenerationInput,
): LocalPatternGenerationResult {
  const { optionType, compositionAdjustment, width, height, brand } = input

  if (!isFinitePositiveInteger(width) || !isFinitePositiveInteger(height)) {
    return { success: false, errorCode: 'invalid_dimensions' }
  }

  const cellCount = width * height

  if (!Number.isSafeInteger(cellCount)) {
    return { success: false, errorCode: 'invalid_dimensions' }
  }

  if (!isGenerationOptionType(optionType)) {
    return { success: false, errorCode: 'invalid_option' }
  }

  if (!isValidComposition(compositionAdjustment)) {
    return { success: false, errorCode: 'invalid_composition' }
  }

  if (!isBrand(brand)) {
    return { success: false, errorCode: 'invalid_brand' }
  }

  return {
    success: true,
    rawResult: createRawPatternResult(input),
  }
}
