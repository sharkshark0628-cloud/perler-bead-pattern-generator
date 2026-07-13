import type { BeadPatternResult } from './generation-session'

export type BeadPatternNormalizationResult =
  | { readonly valid: true; readonly value?: BeadPatternResult }
  | { readonly valid: false }

function isFinitePositiveInteger(value: unknown): value is number {
  return Number.isFinite(value) && Number.isInteger(value) && Number(value) > 0
}

export function normalizeBeadPatternResult(
  patternResult?: unknown,
): BeadPatternNormalizationResult {
  if (patternResult === undefined) {
    return { valid: true }
  }

  if (!patternResult || typeof patternResult !== 'object') {
    return { valid: false }
  }

  const candidate = patternResult as {
    readonly width?: unknown
    readonly height?: unknown
    readonly cells?: unknown
  }
  const width = candidate.width
  const height = candidate.height

  if (!isFinitePositiveInteger(width) || !isFinitePositiveInteger(height)) {
    return { valid: false }
  }

  if (!Array.isArray(candidate.cells)) {
    return { valid: false }
  }

  const expectedCellCount = width * height

  if (!Number.isSafeInteger(expectedCellCount)) {
    return { valid: false }
  }

  if (candidate.cells.length !== expectedCellCount) {
    return { valid: false }
  }

  const cells: BeadPatternResult['cells'][number][] = []

  for (const cell of candidate.cells) {
    if (
      !cell ||
      typeof cell !== 'object' ||
      Array.isArray(cell) ||
      !Object.prototype.hasOwnProperty.call(cell, 'colorCode')
    ) {
      return { valid: false }
    }

    const colorCode = (cell as { readonly colorCode: unknown }).colorCode

    if (colorCode === null) {
      cells.push({ colorCode: null })
      continue
    }

    if (typeof colorCode !== 'string') {
      return { valid: false }
    }

    const normalizedColorCode = colorCode.trim()

    if (normalizedColorCode.length === 0) {
      return { valid: false }
    }

    cells.push({ colorCode: normalizedColorCode })
  }

  return {
    valid: true,
    value: {
      width,
      height,
      // Cells remain row-major: index = row * width + column.
      cells,
    },
  }
}
