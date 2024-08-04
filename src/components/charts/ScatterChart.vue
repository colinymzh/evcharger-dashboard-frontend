<template>
  <!-- Render the Scatter chart component with provided data and options -->
  <Scatter :data="chartData" :options="options" />
</template>

<script>
import { Scatter } from 'vue-chartjs'
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'

// Register Chart.js components to use in the scatter chart
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend)

export default {
  name: 'ScatterChart',
  components: { Scatter },
  props: {
    chartData: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>