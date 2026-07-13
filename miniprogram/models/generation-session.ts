export type BoardSize = '52x52' | '78x78' | '104x104'
export type Difficulty = 'simple' | 'standard' | 'detailed'
export type Brand = 'mard'

export type GenerationOptionType =
  | 'full'
  | 'subject_focused'
  | 'background_removed'

export type GenerationOptionStatus =
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed'
  | 'timeout'

export type GenerationLifecycleStatus =
  | 'idle'
  | 'preparing'
  | 'processing'
  | 'partial_success'
  | 'success'
  | 'failed'
  | 'timeout'

export type GenerationStep =
  | 'image_analysis'
  | 'composition'
  | 'palette_matching'
  | 'complete'

export type Rotation = 0 | 90 | 180 | 270

export type CompositionHorizontal = 'left' | 'center' | 'right'
export type CompositionVertical = 'top' | 'center' | 'bottom'
export type CompositionScale = 'small' | 'medium' | 'large'

export interface ImagePreviewReference {
  readonly tempFilePath?: string
}

export interface ImageMetadata {
  readonly width?: number
  readonly height?: number
  readonly mimeType?: string
  readonly fileName?: string
}

export interface ImagePreviewState {
  readonly reference?: ImagePreviewReference
  readonly metadata?: ImageMetadata
  readonly updatedAt?: number
}

export interface GenerationSettings {
  readonly boardSize: BoardSize
  readonly difficulty: Difficulty
  readonly brand: Brand
}

export interface GenerationOptionSlot {
  readonly type: GenerationOptionType
  readonly status: GenerationOptionStatus
  readonly previewReference?: ImagePreviewReference
  readonly errorCode?: string
  readonly errorMessage?: string
  readonly recommended?: boolean
  readonly selectable?: boolean
}

export interface SelectedOptionState {
  readonly optionType?: GenerationOptionType
}

export interface AdjustmentTransform {
  readonly translationX: number
  readonly translationY: number
  readonly scale: number
  readonly rotation: Rotation
}

export interface CompositionAdjustment {
  readonly horizontal: CompositionHorizontal
  readonly vertical: CompositionVertical
  readonly scale: CompositionScale
}

export const DEFAULT_COMPOSITION_ADJUSTMENT: CompositionAdjustment = {
  horizontal: 'center',
  vertical: 'center',
  scale: 'medium',
}

export interface BeadPatternCell {
  readonly colorCode: string | null
}

export interface BeadPatternResult {
  readonly width: number
  readonly height: number
  // Row-major order: index = row * width + column.
  readonly cells: readonly BeadPatternCell[]
}

export interface GenerationSessionState {
  // Monotonic in-process identity for cache invalidation across synchronous Store commits.
  readonly revision: number
  readonly imagePreview?: ImagePreviewState
  readonly settings: GenerationSettings
  readonly generationLifecycleStatus: GenerationLifecycleStatus
  readonly currentGenerationStep: GenerationStep
  readonly options: readonly GenerationOptionSlot[]
  readonly selectedOption: SelectedOptionState
  readonly adjustment: AdjustmentTransform
  readonly compositionAdjustment: CompositionAdjustment
  // Authoritative semantic bead-grid result for the active generation session.
  readonly patternResult?: BeadPatternResult
  readonly updatedAt?: number
}

export interface GenerationSubmissionSnapshot {
  readonly imagePreview?: ImagePreviewState
  readonly settings: GenerationSettings
}
