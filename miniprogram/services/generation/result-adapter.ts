import { normalizeBeadPatternResult } from '../../models/bead-pattern-result'
import type { BeadPatternResult } from '../../models/generation-session'

export interface RawGenerationPatternCell {
  readonly colorCode?: unknown
}

export interface RawGenerationPatternResult {
  readonly width?: unknown
  readonly height?: unknown
  readonly cells?: unknown
}

export type GenerationResultAdapterErrorCode =
  | 'invalid_payload'
  | 'invalid_dimensions'
  | 'invalid_cell_count'
  | 'invalid_cell'

export type GenerationResultAdapterResult =
  | {
      readonly success: true
      readonly patternResult: BeadPatternResult
    }
  | {
      readonly success: false
      readonly errorCode: GenerationResultAdapterErrorCode
    }

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isFinitePositiveInteger(value: unknown): value is number {
  return Number.isFinite(value) && Number.isInteger(value) && Number(value) > 0
}

function isValidRawCell(value: unknown): value is RawGenerationPatternCell {
  if (
    !isRecord(value) ||
    !Object.prototype.hasOwnProperty.call(value, 'colorCode')
  ) {
    return false
  }

  const colorCode = value.colorCode

  if (colorCode === null) {
    return true
  }

  return typeof colorCode === 'string' && colorCode.trim().length > 0
}

export function adaptGenerationPatternResult(
  raw: unknown,
): GenerationResultAdapterResult {
  // This boundary accepts untrusted provider-neutral payloads only.
  if (!isRecord(raw)) {
    return { success: false, errorCode: 'invalid_payload' }
  }

  const payload = raw as RawGenerationPatternResult

  if (
    !('width' in payload) ||
    !('height' in payload) ||
    !('cells' in payload)
  ) {
    return { success: false, errorCode: 'invalid_payload' }
  }
  const width = payload.width
  const height = payload.height

  if (!isFinitePositiveInteger(width) || !isFinitePositiveInteger(height)) {
    return { success: false, errorCode: 'invalid_dimensions' }
  }

  if (!Array.isArray(payload.cells)) {
    return { success: false, errorCode: 'invalid_payload' }
  }

  const expectedCellCount = width * height

  if (
    !Number.isSafeInteger(expectedCellCount) ||
    payload.cells.length !== expectedCellCount
  ) {
    return { success: false, errorCode: 'invalid_cell_count' }
  }

  if (!payload.cells.every(isValidRawCell)) {
    return { success: false, errorCode: 'invalid_cell' }
  }

  const normalization = normalizeBeadPatternResult(payload)

  if (!normalization.valid || !normalization.value) {
    return { success: false, errorCode: 'invalid_payload' }
  }

  return {
    success: true,
    patternResult: normalization.value,
  }
}
