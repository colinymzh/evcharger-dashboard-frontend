<template>
  <div class="connector-usage-chart">
    <h2 class="title">Connector {{ connectorId }} Usage</h2>
    <div v-if="chartData" class="chart-container">
      <LineChart :chartData="chartData" :options="options" />
    </div>
    <div v-else class="loading">Loading...</div>
  </div>
</template>

<script>
import LineChart from '@/components/charts/LineChart.vue';

export default {
  name: 'ConnectorUsageChart',
  components: {
    LineChart,
  },
  props: {
    connectorId: {
      type: String,
      required: true,
    },
    usageData: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      chartData: null,
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Hour',
            },
          },
          y: {
            min: 0,
            max: 1,
            ticks: {
              stepSize: 0.2,
            },
            title: {
              display: true,
              text: 'Average Usage',
            },
          },
        },
      },
    };
  },
  mounted() {
    this.prepareChartData();
  },
  methods: {
    prepareChartData() {
      this.chartData = {
        labels: this.usageData.map((item) => item.hour),
        datasets: [
          {
            label: 'Usage',
            data: this.usageData.map((item) => item.averageUsage),
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
          },
        ],
      };
    },
  },
};
</script>


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