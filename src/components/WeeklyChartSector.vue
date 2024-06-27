<template>
    <div class="weekly-chart-sector">
      <h2 class="section-title">Weekly Usage</h2>
      <div class="charts-container">
        <div v-for="connector in weeklyUsageData" :key="connector.connectorId" class="chart-wrapper">
          <h3 class="connector-title">Connector {{ connector.connectorId }}</h3>
          <BarChart :chartData="getChartData(connector.weeklyUsage)" />
        </div>
      </div>
    </div>
  </template>

<script>
import BarChart from '@/components/charts/BarChart.vue';

export default {
    name: 'WeeklyChartSector',
    components: {
        BarChart,
    },
    props: {
        weeklyUsageData: Array,
    },
    methods: {
        getChartData(weeklyUsage) {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = weeklyUsage.map(day => day.averageUsage);
  
  const colors = [
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
    'rgba(199, 199, 199, 0.6)'
  ];

  return {
    labels: labels,
    datasets: [{
      label: 'Average Usage',
      data: data,
      backgroundColor: colors,
      borderColor: colors.map(color => color.replace('0.6', '1')),
      borderWidth: 1
    }]
  };
}
    }
}
</script>

<style scoped>
.weekly-chart-sector {
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.section-title {
  color: #277734;
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.charts-container {
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding-bottom: 15px;
}

.chart-wrapper {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  min-width: 395px;
  flex: 0 0 auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.connector-title {
  color: #277734;
  font-size: 18px;
  margin-bottom: 10px;
  text-align: center;
}

/* 自定义滚动条样式 */
.charts-container::-webkit-scrollbar {
  height: 8px;
}

.charts-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.charts-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.charts-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>