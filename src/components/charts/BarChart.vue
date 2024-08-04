<template>
  <div class="connector-usage-chart">
    <div class="chart-container">
      <!-- Render the bar chart using the Bar component from vue-chartjs -->
      <Bar :data="chartData" :options="chartOptions" />
    </div>

  </div>
</template>

<script>
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'BarChart',
  components: { Bar },
  props: {
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 1
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

.connector-usage-chart {
  background-color: #fff;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}
</style>