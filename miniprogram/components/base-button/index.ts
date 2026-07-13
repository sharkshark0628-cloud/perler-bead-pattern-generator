type ButtonVariant = 'primary' | 'secondary' | 'text'
type ButtonSize = 'default' | 'compact'

Component({
  properties: {
    ariaLabel: String,
    block: {
      type: Boolean,
      value: false,
    },
    disabled: {
      type: Boolean,
      value: false,
    },
    label: {
      type: String,
      value: '',
    },
    loading: {
      type: Boolean,
      value: false,
    },
    loadingLabel: {
      type: String,
      value: '',
    },
    size: {
      type: String,
      value: 'default' as ButtonSize,
    },
    variant: {
      type: String,
      value: 'primary' as ButtonVariant,
    },
  },
  methods: {
    handleTap(this: any) {
      if (this.data.disabled || this.data.loading) {
        return
      }

      this.triggerEvent('press')
    },
  },
})
