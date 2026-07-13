interface IAppOption {
  globalData: Record<string, never>
}

declare function App<TAppOption extends object>(options: TAppOption): void
declare function Component(options: any): void
declare function Page(options: any): void
declare const wx: {
  navigateBack(options?: { delta?: number }): void
  navigateTo(options: { url: string }): void
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
}
