interface TabBarItem {
  ariaLabel?: string
  icon?: string
  key: string
  label: string
}

Component({
  properties: {
    activeKey: {
      type: String,
      value: '',
    },
    items: {
      type: Array,
      value: [] as TabBarItem[],
    },
    safeArea: {
      type: Boolean,
      value: true,
    },
  },
  methods: {
    handleChange(this: any, event: WechatMiniprogram.TouchEvent) {
      const key = event.currentTarget.dataset.key
      this.triggerEvent('change', { key })
    },
  },
})
