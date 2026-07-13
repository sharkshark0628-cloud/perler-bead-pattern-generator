import { DEFAULT_COMPOSITION_ADJUSTMENT } from '../models/generation-session'
import { normalizeBeadPatternResult } from '../models/bead-pattern-result'
import type {
  BoardSize,
  Brand,
  BeadPatternResult,
  CompositionAdjustment,
  CompositionHorizontal,
  CompositionScale,
  CompositionVertical,
  Difficulty,
  GenerationLifecycleStatus,
  GenerationOptionSlot,
  GenerationOptionType,
  GenerationSessionState,
  GenerationSettings,
  GenerationStep,
  GenerationSubmissionSnapshot,
  ImagePreviewState,
} from '../models/generation-session'

const DEFAULT_SETTINGS: GenerationSettings = {
  boardSize: '78x78',
  brand: 'mard',
  difficulty: 'standard',
}

const COMPOSITION_HORIZONTAL_VALUES: readonly CompositionHorizontal[] = [
  'left',
  'center',
  'right',
]

const COMPOSITION_VERTICAL_VALUES: readonly CompositionVertical[] = [
  'top',
  'center',
  'bottom',
]

const COMPOSITION_SCALE_VALUES: readonly CompositionScale[] = [
  'small',
  'medium',
  'large',
]

function isCompositionHorizontal(
  value: unknown,
): value is CompositionHorizontal {
  return COMPOSITION_HORIZONTAL_VALUES.includes(value as CompositionHorizontal)
}

function isCompositionVertical(value: unknown): value is CompositionVertical {
  return COMPOSITION_VERTICAL_VALUES.includes(value as CompositionVertical)
}

function isCompositionScale(value: unknown): value is CompositionScale {
  return COMPOSITION_SCALE_VALUES.includes(value as CompositionScale)
}

function hasMeaningfulImageReference(
  reference?: ImagePreviewState['reference'],
): boolean {
  return (
    typeof reference?.tempFilePath === 'string' &&
    reference.tempFilePath.trim().length > 0
  )
}

function areImageReferencesEqual(
  left?: ImagePreviewState['reference'],
  right?: ImagePreviewState['reference'],
): boolean {
  return left?.tempFilePath === right?.tempFilePath
}

function hasNewImageReference(
  nextReference?: ImagePreviewState['reference'],
  currentReference?: ImagePreviewState['reference'],
): boolean {
  return (
    hasMeaningfulImageReference(nextReference) &&
    !areImageReferencesEqual(nextReference, currentReference)
  )
}

function normalizeCompositionAdjustment(
  adjustment?: Partial<CompositionAdjustment>,
): CompositionAdjustment {
  return {
    horizontal: isCompositionHorizontal(adjustment?.horizontal)
      ? adjustment.horizontal
      : DEFAULT_COMPOSITION_ADJUSTMENT.horizontal,
    vertical: isCompositionVertical(adjustment?.vertical)
      ? adjustment.vertical
      : DEFAULT_COMPOSITION_ADJUSTMENT.vertical,
    scale: isCompositionScale(adjustment?.scale)
      ? adjustment.scale
      : DEFAULT_COMPOSITION_ADJUSTMENT.scale,
  }
}

function clonePatternResult(
  patternResult?: BeadPatternResult,
): BeadPatternResult | undefined {
  const normalization = normalizeBeadPatternResult(patternResult)

  return normalization.valid ? normalization.value : undefined
}

const GENERATION_OPTION_TYPES: readonly GenerationOptionType[] = [
  'full',
  'subject_focused',
  'background_removed',
]

const DEFAULT_OPTION_SLOTS: readonly GenerationOptionSlot[] = [
  { type: 'full', status: 'pending', selectable: false },
  { type: 'subject_focused', status: 'pending', selectable: false },
  { type: 'background_removed', status: 'pending', selectable: false },
]

let sessionRevision = 0

function getNextSessionRevision(): number {
  sessionRevision += 1
  return sessionRevision
}

export function createInitialGenerationSessionState(
  revision = 0,
): GenerationSessionState {
  return {
    revision,
    settings: { ...DEFAULT_SETTINGS },
    generationLifecycleStatus: 'idle',
    currentGenerationStep: 'image_analysis',
    options: DEFAULT_OPTION_SLOTS.map((option) => ({ ...option })),
    selectedOption: {},
    adjustment: {
      translationX: 0,
      translationY: 0,
      scale: 1,
      rotation: 0,
    },
    compositionAdjustment: normalizeCompositionAdjustment(),
  }
}

function cloneGenerationSessionState(
  state: GenerationSessionState,
): GenerationSessionState {
  return {
    ...state,
    imagePreview: state.imagePreview
      ? {
          ...state.imagePreview,
          reference: state.imagePreview.reference
            ? { ...state.imagePreview.reference }
            : undefined,
          metadata: state.imagePreview.metadata
            ? { ...state.imagePreview.metadata }
            : undefined,
        }
      : undefined,
    settings: { ...state.settings },
    options: state.options.map((option) => ({
      ...option,
      previewReference: option.previewReference
        ? { ...option.previewReference }
        : undefined,
    })),
    selectedOption: { ...state.selectedOption },
    adjustment: { ...state.adjustment },
    compositionAdjustment: normalizeCompositionAdjustment(
      state.compositionAdjustment,
    ),
    patternResult: clonePatternResult(state.patternResult),
  }
}

function cloneGenerationOptionSlot(
  option: GenerationOptionSlot,
): GenerationOptionSlot {
  return {
    ...option,
    previewReference: option.previewReference
      ? { ...option.previewReference }
      : undefined,
  }
}

function buildFixedGenerationOptionSlots(
  options: readonly GenerationOptionSlot[],
): GenerationOptionSlot[] {
  return GENERATION_OPTION_TYPES.map((type) => {
    const option = options.find((candidate) => candidate.type === type)

    return cloneGenerationOptionSlot(
      option ?? { type, status: 'pending', selectable: false },
    )
  })
}

function areGenerationOptionSlotsEqual(
  leftOptions: readonly GenerationOptionSlot[],
  rightOptions: readonly GenerationOptionSlot[],
): boolean {
  return (
    leftOptions.length === rightOptions.length &&
    leftOptions.every((leftOption, index) => {
      const rightOption = rightOptions[index]

      return (
        Boolean(rightOption) &&
        leftOption.type === rightOption.type &&
        leftOption.status === rightOption.status &&
        leftOption.errorCode === rightOption.errorCode &&
        leftOption.errorMessage === rightOption.errorMessage &&
        leftOption.recommended === rightOption.recommended &&
        leftOption.selectable === rightOption.selectable &&
        areImageReferencesEqual(
          leftOption.previewReference,
          rightOption.previewReference,
        )
      )
    })
  )
}

let currentSession = createInitialGenerationSessionState()

export function getGenerationSessionState(): GenerationSessionState {
  return cloneGenerationSessionState(currentSession)
}

export function updateImagePreviewState(
  imagePreview: ImagePreviewState,
): GenerationSessionState {
  const shouldClearPatternResult = hasNewImageReference(
    imagePreview.reference,
    currentSession.imagePreview?.reference,
  )

  currentSession = {
    ...currentSession,
    imagePreview: {
      reference: imagePreview.reference
        ? { ...imagePreview.reference }
        : currentSession.imagePreview?.reference,
      metadata: imagePreview.metadata
        ? { ...imagePreview.metadata }
        : currentSession.imagePreview?.metadata,
      updatedAt: imagePreview.updatedAt ?? Date.now(),
    },
    patternResult: shouldClearPatternResult
      ? undefined
      : currentSession.patternResult,
    revision: getNextSessionRevision(),
    updatedAt: Date.now(),
  }

  return getGenerationSessionState()
}

export function updateGenerationSettings(settings: {
  boardSize: BoardSize
  difficulty: Difficulty
  brand: Brand
}): GenerationSessionState {
  currentSession = {
    ...currentSession,
    settings: { ...settings },
    patternResult: undefined,
    revision: getNextSessionRevision(),
    updatedAt: Date.now(),
  }

  return getGenerationSessionState()
}

export function updateGenerationLifecycle(lifecycle: {
  status: GenerationLifecycleStatus
  step: GenerationStep
}): GenerationSessionState {
  currentSession = {
    ...currentSession,
    generationLifecycleStatus: lifecycle.status,
    currentGenerationStep: lifecycle.step,
    revision: getNextSessionRevision(),
    updatedAt: Date.now(),
  }

  return getGenerationSessionState()
}

export function updateGenerationOptions(
  options: readonly GenerationOptionSlot[],
): GenerationSessionState {
  const nextOptions = buildFixedGenerationOptionSlots(options)
  const shouldKeepSelectedOption = options.some(
    (option) =>
      option.type === currentSession.selectedOption.optionType &&
      option.status === 'success' &&
      option.selectable !== false,
  )
  const shouldClearPatternResult =
    !shouldKeepSelectedOption ||
    !areGenerationOptionSlotsEqual(currentSession.options, nextOptions)

  currentSession = {
    ...currentSession,
    options: nextOptions,
    selectedOption: shouldKeepSelectedOption
      ? { ...currentSession.selectedOption }
      : {},
    patternResult: shouldClearPatternResult
      ? undefined
      : currentSession.patternResult,
    revision: getNextSessionRevision(),
    updatedAt: Date.now(),
  }

  return getGenerationSessionState()
}

export function selectGenerationOption(
  optionType: GenerationOptionType,
): GenerationSessionState {
  const option = currentSession.options.find(
    (candidate) => candidate.type === optionType,
  )

  if (!option || option.status !== 'success' || option.selectable === false) {
    return getGenerationSessionState()
  }

  currentSession = {
    ...currentSession,
    selectedOption: { optionType },
    patternResult:
      currentSession.selectedOption.optionType === optionType
        ? currentSession.patternResult
        : undefined,
    revision: getNextSessionRevision(),
    updatedAt: Date.now(),
  }

  return getGenerationSessionState()
}

export function updateCompositionAdjustment(
  compositionAdjustment: CompositionAdjustment,
): GenerationSessionState {
  currentSession = {
    ...currentSession,
    compositionAdjustment: normalizeCompositionAdjustment(compositionAdjustment),
    revision: getNextSessionRevision(),
    updatedAt: Date.now(),
  }

  return getGenerationSessionState()
}

export function updatePatternResult(
  patternResult?: BeadPatternResult,
): boolean {
  const normalization = normalizeBeadPatternResult(patternResult)

  if (!normalization.valid) {
    // Invalid handoffs clear stale output so Page 07 cannot show a previous generation result.
    currentSession = {
      ...currentSession,
      patternResult: undefined,
      revision: getNextSessionRevision(),
      updatedAt: Date.now(),
    }
    return false
  }

  currentSession = {
    ...currentSession,
    patternResult: normalization.value,
    revision: getNextSessionRevision(),
    updatedAt: Date.now(),
  }

  return true
}

export function prepareGeneration(): GenerationSessionState {
  currentSession = {
    ...currentSession,
    generationLifecycleStatus: 'preparing',
    currentGenerationStep: 'image_analysis',
    options: DEFAULT_OPTION_SLOTS.map((option) => ({ ...option })),
    selectedOption: {},
    compositionAdjustment: normalizeCompositionAdjustment(),
    patternResult: undefined,
    revision: getNextSessionRevision(),
    updatedAt: Date.now(),
  }

  return getGenerationSessionState()
}

export function resetGenerationSession(): GenerationSessionState {
  currentSession = createInitialGenerationSessionState(
    getNextSessionRevision(),
  )

  return getGenerationSessionState()
}

export function getGenerationSubmissionSnapshot(): GenerationSubmissionSnapshot {
  const snapshot = getGenerationSessionState()

  return {
    imagePreview: snapshot.imagePreview,
    settings: snapshot.settings,
  }
}
