<template>
    <div class="weekly-chart-sector">
        <h2 class="section-title">Weekly Usage</h2>
        <div class="charts-container">
            <!-- Loop through each connector's weekly usage data -->
            <div v-for="connector in weeklyUsageData" :key="connector.connectorId" class="chart-wrapper">
                <h3 class="connector-title">Connector {{ connector.connectorId }}</h3>
                <!-- Render a BarChart component for each connector -->
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
        // Method to prepare chart data for each connector
        getChartData(weeklyUsage) {
            const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const data = weeklyUsage.map(day => day.averageUsage);

            const color = 'rgba(75, 192, 192, 0.6)';
            const borderColor = 'rgba(75, 192, 192, 1)';

            // Return the chart configuration object
            return {
                labels: labels,
                datasets: [{
                    label: 'Average Usage',
                    data: data,
                    backgroundColor: color,
                    borderColor: borderColor,
                    borderWidth: 1
                }],
                options: {
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
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
    min-width: 480px;
    flex: 0 0 auto;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.connector-title {
    color: #277734;
    font-size: 18px;
    margin-bottom: 10px;
    text-align: center;
}

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