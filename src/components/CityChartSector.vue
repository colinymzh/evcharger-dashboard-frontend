<template>
  <div class="city-chart-sector">
    <!-- Title displaying the city name -->
    <h3>Weekly Usage for {{ cityName }}</h3>
    <div class="chart-container">
      <!-- Bar chart component, passing in the computed chartData -->
      <BarChart :chartData="chartData" />
    </div>
  </div>
</template>

<script>
import BarChart from './charts/BarChart.vue';

export default {
  name: 'CityChartSector',
  components: {
    BarChart
  },
  props: {
    cityWeeklyUsageData: {
      type: Object,
      required: true
    }
  },
  computed: {
    // Computed property to get the city name
    cityName() {
      return this.cityWeeklyUsageData.cityName;
    },
    // Computed property to format data for the chart
    chartData() {
      // Extract days of the week for chart labels
      const labels = this.cityWeeklyUsageData.weeklyUsage.map(item => item.dayOfWeek);
      // Extract average usage data for chart values
      const data = this.cityWeeklyUsageData.weeklyUsage.map(item => item.averageUsage);

      // Return formatted data for the chart
      return {
        labels: labels,
        datasets: [{
          label: 'Average Usage',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)'
        }]
      };
    }
  }
}
</script>

<style scoped>
.city-chart-sector {
  border-radius: 10px;
  padding: 20px;
  margin: 20px auto;
  max-width: 500px;
  text-align: center;
}

h3 {
  color: #2c3e50;
  font-size: 1.5em;
  margin-bottom: 20px;
}

.chart-container {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
}
</style>