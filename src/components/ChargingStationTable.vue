<template>
    <div>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Station Name</th>
            <th>City</th>
            <th>Street</th>
            <th>Postcode</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="station in stations" :key="station.stationName">
            <td>
              <input type="checkbox" :value="station" v-model="selectedStations">
            </td>
            <td>
              <a href="#" @click.prevent="fetchStationDetails(station.stationName)">{{ station.stationName }}</a>
            </td>
            <td>{{ station.city }}</td>
            <td>{{ station.street }}</td>
            <td>{{ station.postcode }}</td>
          </tr>
        </tbody>
      </table>
      <div class="selected-stations-grid" v-if="selectedStations.length > 0">
        <div class="station-card" v-for="(station, index) in selectedStations" :key="index">
          <p><strong>Station Name:</strong> {{ station.stationName }}</p>
          <p><strong>City:</strong> {{ station.city }}</p>
          <p><strong>Street:</strong> {{ station.street }}</p>
          <p><strong>Postcode:</strong> {{ station.postcode }}</p>
        </div>
      </div>
      <button @click="clearAllSelections" v-if="selectedStations.length > 0">Clear All</button>
  
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="closeModal">&times;</span>
          <h2>{{ selectedStation.stationName }}</h2>
          <p><strong>City:</strong> {{ selectedStation.city }}</p>
          <p><strong>Street:</strong> {{ selectedStation.street }}</p>
          <p><strong>Postcode:</strong> {{ selectedStation.postcode }}</p>
          <!-- 在这里添加其他需要显示的详细信息 -->
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'ChargingStationTable',
    props: {
      stations: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        selectedStations: [],
        showModal: false,
        selectedStation: {},
      };
    },
    methods: {
      clearAllSelections() {
        this.selectedStations = [];
      },
      async fetchStationDetails(stationName) {
        try {
          const response = await axios.get(`http://localhost:8080/stations/${stationName}`);
          this.selectedStation = response.data;
          this.showModal = true;
        } catch (error) {
          console.error('Failed to fetch station details:', error);
        }
      },
      closeModal() {
        this.showModal = false;
      },
    },
  };
  </script>
  
  <style scoped>
  .selected-stations-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-top: 20px;
  }
  
  .station-card {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px;
    background-color: #f5f5f5;
  }
  </style>
  
  <style scoped>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
  }
  
  th {
    background-color: #f2f2f2;
  }

  .selected-stations-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.station-card {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  background-color: #f5f5f5;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal {
  display: block;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 50%;
  position: relative;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
  </style>