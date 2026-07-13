Component({
  properties: {
    disabled: {
      type: Boolean,
      value: false,
    },
    error: {
      type: String,
      value: '',
    },
    label: {
      type: String,
      value: '',
    },
    maxlength: {
      type: Number,
      value: 140,
    },
    placeholder: {
      type: String,
      value: '',
    },
    type: {
      type: String,
      value: 'text',
    },
    value: {
      type: String,
      value: '',
    },
  },
  data: {
    focused: false,
  },
  methods: {
    handleBlur(this: any, event: WechatMiniprogram.InputBlur) {
      this.setData({ focused: false })
      this.triggerEvent('blur', event.detail)
    },
    handleConfirm(this: any, event: WechatMiniprogram.InputConfirm) {
      this.triggerEvent('confirm', event.detail)
    },
    handleFocus(this: any, event: WechatMiniprogram.InputFocus) {
      this.setData({ focused: true })
      this.triggerEvent('focus', event.detail)
    },
    handleInput(this: any, event: WechatMiniprogram.Input) {
      this.triggerEvent('input', event.detail)
    },
  },
})
