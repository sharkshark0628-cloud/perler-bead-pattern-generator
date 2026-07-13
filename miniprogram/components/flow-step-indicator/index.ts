interface FlowStep {
  key: string
  label: string
}

Component({
  properties: {
    ariaLabel: {
      type: String,
      value: 'Flow progress',
    },
    currentIndex: {
      type: Number,
      value: 0,
    },
    steps: {
      type: Array,
      value: [] as FlowStep[],
    },
  },
})

