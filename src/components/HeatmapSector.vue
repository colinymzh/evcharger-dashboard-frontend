<template>
    <div class="heatmap-sector">
        <h3>Weekly Hourly Usage Heatmap</h3>
        <div v-for="connector in heatmapData" :key="connector.connectorId" class="connector-heatmap">
            <h4>Connector {{ connector.connectorId }}</h4>
            <div class="chart-container">
                <canvas :ref="'heatmap-' + connector.connectorId"></canvas>
            </div>
        </div>
    </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
    name: 'HeatmapSector',
    props: {
        weeklyHourlyUsageData: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            charts: []
        }
    },
    computed: {
        heatmapData() {
            return this.weeklyHourlyUsageData.map(connector => {
                const data = connector.weeklyHourlyUsage.flatMap((day, dayIndex) =>
                    day.hourlyUsage.map(hour => ({
                        x: hour.hour,
                        y: dayIndex,
                        value: hour.averageUsage
                    }))
                );
                return {
                    connectorId: connector.connectorId,
                    data: data
                };
            });
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.createHeatmaps();
        });
    },
    methods: {
        createHeatmaps() {
            this.heatmapData.forEach(connector => {
                const ctx = this.$refs[`heatmap-${connector.connectorId}`][0];
                const chart = new Chart(ctx, {
                    type: 'scatter',
                    data: {
                        datasets: [{
                            label: 'Hourly Usage',
                            data: connector.data,
                            backgroundColor: (context) => {
                                const value = context.raw.value;
                                return `rgba(0, 128, 0, ${value})`;
                            },
                            pointRadius: 15,
                            pointHoverRadius: 17,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                type: 'linear',
                                position: 'bottom',
                                min: -0.5,
                                max: 24,
                                ticks: {
                                    stepSize: 6,
                                    callback: (value) => {
                                        if (value === 0 || value === 6 || value === 12 || value === 18 || value === 24) {
                                            return value.toString();
                                        }
                                        return '';
                                    },
                                    display: true
                                },
                                title: {
                                    display: true,
                                    text: 'Hour of Day'
                                },
                                grid: {
                                    display: false
                                },
                                border: {
                                    display: true
                                }
                            },
                            y: {
                                type: 'linear',
                                reverse: true,
                                min: -1,
                                max: 6.5,
                                ticks: {
                                    stepSize: 1,
                                    callback: (value) => {
                                        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                                        return value >= 0 && value <= 6 ? days[Math.round(value)] : '';
                                    },
                                    display: true
                                },
                                title: {
                                    display: true,
                                    text: 'Day of Week'
                                },
                                grid: {
                                    display: false
                                },
                                border: {
                                    display: true
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label(context) {
                                        const v = context.raw;
                                        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                                        return [`Day: ${days[v.y]}`,
                                        `Hour: ${v.x}`,
                                        `Usage: ${v.value.toFixed(2)}`];
                                    }
                                }
                            },
                            legend: {
                                display: false
                            }
                        }
                    }
                });
                this.charts.push(chart);
            });
        }
    },
    beforeUnmount() {
        this.charts.forEach(chart => chart.destroy());
    }
}
</script>

<style scoped>
.heatmap-sector {
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin: 20px auto;
    max-width: 800px;
}

h3 {
    color: #2c3e50;
    font-size: 1.5em;
    margin-bottom: 20px;
    text-align: center;
}

.connector-heatmap {
    margin-bottom: 30px;
}

h4 {
    color: #34495e;
    margin-bottom: 10px;
}

canvas {
    width: 100%;
    height: 300px;
}
</style>