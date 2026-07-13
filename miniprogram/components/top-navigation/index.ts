Component({
  properties: {
    backLabel: {
      type: String,
      value: 'Back',
    },
    moreLabel: {
      type: String,
      value: 'More',
    },
    showBack: {
      type: Boolean,
      value: true,
    },
    showMore: {
      type: Boolean,
      value: false,
    },
    title: {
      type: String,
      value: '',
    },
  },
  methods: {
    handleBack(this: any) {
      this.triggerEvent('back')
    },
    handleMore(this: any) {
      this.triggerEvent('more')
    },
  },
})
