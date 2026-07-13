interface IAppOption {
  globalData: Record<string, never>
}

declare function App<TAppOption extends object>(options: TAppOption): void
declare function Component(options: any): void
declare function Page(options: any): void
declare const wx: {
  chooseMedia(options: WechatMiniprogram.ChooseMediaOption): void
  getImageInfo(options: WechatMiniprogram.GetImageInfoOption): void
  navigateBack(options?: { delta?: number }): void
  navigateTo(options: { url: string }): void
  showToast(options: { icon?: 'success' | 'error' | 'loading' | 'none'; title: string }): void
}

declare namespace WechatMiniprogram {
  interface EventTarget {
    dataset: Record<string, unknown>
  }

  interface BaseEvent<TDetail = unknown> {
    currentTarget: EventTarget
    detail: TDetail
  }

  type TouchEvent = BaseEvent

  type CustomEvent<TDetail = unknown> = BaseEvent<TDetail>

  type Input = BaseEvent<{
    value: string
  }>

  type InputBlur = BaseEvent<{
    value: string
  }>

  type InputConfirm = BaseEvent<{
    value: string
  }>

  type InputFocus = BaseEvent<{
    value: string
  }>

  interface ChooseMediaTempFile {
    readonly tempFilePath: string
    readonly size?: number
    readonly fileType?: 'image' | 'video'
  }

  interface ChooseMediaSuccessCallbackResult {
    readonly tempFiles: readonly ChooseMediaTempFile[]
    readonly type?: 'image' | 'video' | 'mix'
  }

  interface ChooseMediaOption {
    readonly count?: number
    readonly mediaType?: readonly ('image' | 'video' | 'mix')[]
    readonly sourceType?: readonly ('album' | 'camera')[]
    readonly sizeType?: readonly ('original' | 'compressed')[]
    readonly success?: (result: ChooseMediaSuccessCallbackResult) => void
    readonly fail?: (error: unknown) => void
  }

  interface GetImageInfoSuccessCallbackResult {
    readonly width: number
    readonly height: number
    readonly path: string
    readonly type?: string
  }

  interface GetImageInfoOption {
    readonly src: string
    readonly success?: (result: GetImageInfoSuccessCallbackResult) => void
    readonly fail?: (error: unknown) => void
  }
}
