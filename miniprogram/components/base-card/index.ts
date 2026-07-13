type CardVariant = 'primary' | 'tinted' | 'floating'

Component({
  properties: {
    interactive: {
      type: Boolean,
      value: false,
    },
    selected: {
      type: Boolean,
      value: false,
    },
    variant: {
      type: String,
      value: 'primary' as CardVariant,
    },
  },
  methods: {
    handleTap(this: any) {
      if (!this.data.interactive) {
        return
      }

      this.triggerEvent('press')
    },
  },
})
