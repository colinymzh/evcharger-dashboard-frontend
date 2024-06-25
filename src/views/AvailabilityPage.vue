<template>
  <div>
    <h1>Availability for {{ stationName }}</h1>
    <div>
      <label for="date-input">Select Date:</label>
      <input type="date" id="date-input" v-model="selectedDate" @change="fetchAvailability" />
    </div>
    <div v-if="!selectedDate" class="date-prompt">
      Please select a date to check availability.
    </div>
    <div v-else-if="availability.length === 0" class="no-data-prompt">
      No availability data found for the selected date.
    </div>
    <table v-else class="availability-table">
      <thead>
        <tr>
          <th>Hour</th>
          <th v-for="connectorId in connectorIds" :key="connectorId">
            Connector ID: {{ connectorId }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="hour in 24" :key="hour">
          <td>{{ hour - 1 }}</td>
          <td v-for="connectorId in connectorIds" :key="connectorId">
            <span :class="{
              'available': getAvailabilityForHourAndConnector(hour - 1, connectorId) === 'Yes',
              'unavailable': getAvailabilityForHourAndConnector(hour - 1, connectorId) === 'No',
            }">{{ getAvailabilityForHourAndConnector(hour - 1, connectorId) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="availability.length > 0" class="charts-container">
      <div v-for="connectorId in connectorIds" :key="connectorId" class="chart-wrapper"
        v-memo="[connectorId, availability]">
        <h2>Availability Chart for Connector ID: {{ connectorId }}</h2>
        <scatter-chart :chart-data="getChartDataForConnector(connectorId)" :options="chartOptions"
          :height="250"></scatter-chart>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ScatterChart from '@/components/ScatterChart.vue';

export default {
  name: 'AvailabilityPage',
  components: {
    ScatterChart,
  },
  data() {
    return {
      stationName: '',
      availability: [],
      selectedDate: null,
      connectorIds: [],
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Hour',
            },
            min: 0,
            max: 23,
            ticks: {
              stepSize: 1,
            },
          },
          y: {
            title: {
              display: true,
              text: 'Availability',
            },
            min: -0.5,
            max: 1.5,
            ticks: {
              stepSize: 1,
              callback: function (value) {
                return value === 1 ? 'Available' : (value === 0 ? 'Unavailable' : '');
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const hour = context.parsed.x;
                const status = context.parsed.y === 1 ? 'Available' : 'Unavailable';
                return `Hour ${hour}: ${status}`;
              }
            }
          }
        },
      },
    };
  },
  created() {
    this.stationName = this.$route.params.stationName;
  },

  methods: {
    async fetchAvailability() {
      try {
        const response = await axios.get(`http://localhost:8088/availability/station`, {
          params: {
            stationName: this.stationName,
            date: this.selectedDate,
          },
        });
        this.availability = response.data;
        this.connectorIds = [...new Set(response.data.map(item => item.connectorId))];
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      }
    },
    getAvailabilityForHourAndConnector(hour, connectorId) {
      const item = this.availability.find(
        item => item.hour === hour && item.connectorId === connectorId
      );
      return item ? (item.isAvailable ? 'Yes' : 'No') : '-';
    },
    getChartDataForConnector(connectorId) {
      const data = this.availability
        .filter(item => item.connectorId === connectorId)
        .map(item => ({
          x: item.hour,
          y: item.isAvailable ? 1 : 0
        }));

      return {
        datasets: [{
          data: data,
          backgroundColor: this.getRandomColor(),
          pointRadius: 8,
          pointHoverRadius: 10,
        }]
      };
    },
    getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
  },
};
</script>

<style scoped>
.date-prompt {
  color: #277734;
  font-size: 16px;
  margin-bottom: 20px;
}

.no-data-prompt {
  color: #ff4d4d;
  font-size: 16px;
  margin-bottom: 20px;
}

.availability-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.availability-table th,
.availability-table td {
  padding: 10px;
  text-align: center;
  border: 1px solid #ddd;
}

.availability-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.available {
  color: #277734;
  font-weight: bold;
}

.unavailable {
  color: #ff4d4d;
  font-weight: bold;
}

.charts-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.chart-wrapper {
  width: 45%;
  height: 300px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .chart-wrapper {
    width: 100%;
  }
}
</style>