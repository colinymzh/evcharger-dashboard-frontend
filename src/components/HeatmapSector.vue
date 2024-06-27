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
                const data = connector.weeklyHourlyUsage.flatMap((day, dayIndex) => {
                    const timeSlots = [
                        { start: 0, end: 4 },
                        { start: 4, end: 8 },
                        { start: 8, end: 12 },
                        { start: 12, end: 16 },
                        { start: 16, end: 20 },
                        { start: 20, end: 24 }
                    ];

                    return timeSlots.map((slot, slotIndex) => {
                        const slotHours = day.hourlyUsage.filter(hour =>
                            hour.hour >= slot.start && hour.hour < slot.end
                        );
                        const averageUsage = slotHours.reduce((sum, hour) => sum + hour.averageUsage, 0) / slotHours.length;

                        return {
                            x: slotIndex,
                            y: dayIndex,
                            value: averageUsage
                        };
                    });
                });

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
                            pointRadius: 15, // 减小点的大小
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
                                max: 5.4,
                                ticks: {
                                    stepSize: 1,
                                    callback: function (value, index, values) {
                                        const labels = ['0-4', '4-8', '8-12', '12-16', '16-20', '20-24'];
                                        return labels[value];
                                    },
                                    display: true,
                                    font: {
                                        size: 10
                                    }
                                },
                                title: {
                                    display: true,
                                    text: 'Time of Day'
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
                                min: -0.5,
                                max: 7,
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
                                        const timeSlots = ['0-4', '4-8', '8-12', '12-16', '16-20', '20-24'];
                                        return [
                                            `Day: ${days[v.y]}`,
                                            `Time: ${timeSlots[v.x]}`,
                                            `Average Usage: ${v.value.toFixed(2)}`
                                        ];
                                    }
                                }
                            },
                            legend: {
                                display: false
                            }
                        },
                        layout: {
                            padding: {
                                top: 10,
                                right: 10,
                                bottom: 20, // 增加底部填充以显示 x 轴标签
                                left: 10
                            }
                        }
                    }
                });
                this.charts.push(chart);
            });
        },
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