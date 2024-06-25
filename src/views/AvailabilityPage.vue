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
          <td>{{ hour }}</td>
          <td v-for="connectorId in connectorIds" :key="connectorId">
            <span
              :class="{
                'available': getAvailabilityForHourAndConnector(hour, connectorId) === 'Yes',
                'unavailable': getAvailabilityForHourAndConnector(hour, connectorId) === 'No',
              }"
              >{{ getAvailabilityForHourAndConnector(hour, connectorId) }}</span
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AvailabilityPage',
  data() {
    return {
      stationName: '',
      availability: [],
      selectedDate: null,
      connectorIds: [],
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
        item => item.hour === hour - 1 && item.connectorId === connectorId
      );
      return item ? (item.isAvailable ? 'Yes' : 'No') : '-';
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
</style>