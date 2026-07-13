import type {
  BeadPatternResult,
  GenerationSessionState,
} from '../../models/generation-session'
import {
  getGenerationSessionState,
  updatePatternResult,
} from '../../stores/generation-session-store'
import {
  adaptGenerationPatternResult,
  type GenerationResultAdapterErrorCode,
} from './result-adapter'

export type GenerationPipelineErrorCode =
  | 'result_adaptation_failed'
  | 'invalid_generation_session'
  | 'result_persistence_failed'

export type GenerationPipelineResult =
  | {
      readonly success: true
      readonly patternResult: BeadPatternResult
    }
  | {
      readonly success: false
      readonly errorCode: 'result_adaptation_failed'
      readonly adapterErrorCode: GenerationResultAdapterErrorCode
    }
  | {
      readonly success: false
      readonly errorCode: Exclude<
        GenerationPipelineErrorCode,
        'result_adaptation_failed'
      >
    }

function hasValidCommittedOption(session: GenerationSessionState): boolean {
  const selectedOptionType = session.selectedOption.optionType

  if (!selectedOptionType) {
    return false
  }

  return session.options.some(
    (option) =>
      option.type === selectedOptionType &&
      option.status === 'success' &&
      option.selectable !== false,
  )
}

function clearStalePatternResult(): void {
  updatePatternResult(undefined)
}

export function handoffGenerationResult(
  rawResult: unknown,
): GenerationPipelineResult {
  if (!hasValidCommittedOption(getGenerationSessionState())) {
    clearStalePatternResult()

    return {
      success: false,
      errorCode: 'invalid_generation_session',
    }
  }

  const adapted = adaptGenerationPatternResult(rawResult)

  if (!adapted.success) {
    clearStalePatternResult()

    return {
      success: false,
      errorCode: 'result_adaptation_failed',
      adapterErrorCode: adapted.errorCode,
    }
  }

  const wasStored = updatePatternResult(adapted.patternResult)

  if (!wasStored) {
    // Store rejection should never preserve an older final result.
    clearStalePatternResult()

    return {
      success: false,
      errorCode: 'result_persistence_failed',
    }
  }

  return {
    success: true,
    patternResult:
      getGenerationSessionState().patternResult ?? adapted.patternResult,
  }
}
