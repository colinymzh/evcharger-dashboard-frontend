<script>
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

export default {
    name: 'ConnectorTimePeriodChart',
    components: { Line },
    props: {
        connectorId: String,
        usageData: Array,
    },
    data() {
        return {
            chartData: null,
            chartOptions: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Hour',
                        },
                    },
                    y: {
                        beginAtZero: true,
                        max: 1,
                        title: {
                            display: true,
                            text: 'Average Usage'
                        }
                    }
                }
            }
        }
    },
    mounted() {
        this.renderChart()
    },
    methods: {
        renderChart() {
    if (this.usageData && this.usageData.length > 0) {
      const timePeriods = ['0-7', '8-11', '12-17', '18-21', '22-24']
      const averages = new Array(5).fill(0)

      this.usageData.forEach(item => {
        const hour = item.hour
        let index
        if (hour >= 0 && hour < 7) index = 0
        else if (hour >= 7 && hour < 11) index = 1
        else if (hour >= 11 && hour < 17) index = 2
        else if (hour >= 17 && hour < 21) index = 3
        else index = 4

        averages[index] = item.averageUsage
      })

      this.chartData = {
        labels: timePeriods,
        datasets: [
          {
            label: `Connector ${this.connectorId} Usage`,
            borderColor: '#f87979',
            data: averages,
            fill: false,
            tension: 0.1
          }
        ]
      }
    } else {
      console.warn(`No usage data available for connector ${this.connectorId}`)
      this.chartData = null
    }
  }
    },
    watch: {
        usageData: {
            handler: 'renderChart',
            deep: true
        }
    }
}
</script>

<template>
    <div class="connector-usage-chart">
        <h2 class="title">Connector {{ connectorId }} Usage</h2>

        <div class="chart-container" v-if="chartData">
            <Line :data="chartData" :options="chartOptions" />
        </div>

        <div v-else class="loading">Loading...</div>
    </div>
</template>


<style scoped>
.connector-usage-chart {
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 16px;
    margin-bottom: 16px;
}

.title {
    color: #277734;
    font-size: 18px;
    margin-bottom: 8px;
}

.chart-container {
    position: relative;
    height: 300px;
}

.loading {
    color: #555;
    font-style: italic;
    text-align: center;
    padding: 20px;
}
</style>