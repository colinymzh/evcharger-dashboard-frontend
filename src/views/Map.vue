<template>
  <div>
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <div class="search-container">
      <input v-model="searchQuery" @keyup.enter="searchLocation"
        placeholder="Enter address, postcode, or destination" />
      <button @click="searchLocation">Search</button>
      <button @click="useCurrentLocation">Use Current Location</button>
    </div>
    <div class="map-container">
      <l-map ref="map" v-model:zoom="zoom" :center="center">
        <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"></l-tile-layer>
        <l-marker v-for="station in stations" :key="station.stationName"
          :lat-lng="[station.coordinatesY, station.coordinatesX]" :icon="getMarkerIcon(station.usageLevel)">
          <l-popup>
            <div>
              Station: {{ station.stationName }}<br>
              Average Usage: {{ station.averageUsage.toFixed(2) }}<br>
              Usage Level: {{ station.usageLevel }}<br>
              <button @click="goToStationDetails(station.stationName)" class="details-button">
                View Details
              </button>
            </div>
          </l-popup>
        </l-marker>

        <l-marker v-if="searchedLocation" :lat-lng="searchedLocation">
          <l-popup>
            <div>
              Searched Location<br>
              {{ searchQuery }}
            </div>
          </l-popup>
        </l-marker>
      </l-map>
    </div>
    <div v-if="hasSearched && nearbyStations.length > 0" class="nearby-stations">
      <h2>Nearby Charging Stations</h2>
      <table>
        <thead>
          <tr>
            <th>Station Name</th>
            <th>Average Usage</th>
            <th>Usage Level</th>
            <th>Distance (km)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="station in nearbyStations" :key="station.stationName">
            <td>{{ station.stationName }}</td>
            <td>{{ station.averageUsage.toFixed(2) }}</td>
            <td>{{ station.usageLevel }}</td>
            <td>{{ station.distance.toFixed(2) }}</td>
            <td>
              <button @click="goToStationDetails(station.stationName)" class="details-button">
                View Details
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import L from 'leaflet';
import { useRouter } from 'vue-router';

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
  },
  setup() {
    const stations = ref([]);
    const nearbyStations = ref([]);
    const center = ref([56.4907, -4.2026]); // Scotland center
    const zoom = ref(7);
    const loading = ref(true);
    const router = useRouter();
    const searchQuery = ref('');
    const map = ref(null);
    const hasSearched = ref(false);
    const searchedLocation = ref(null);
    



    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of the Earth in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    };

    const exploreNearbyStations = async () => {
      loading.value = true;
      try {
        const response = await axios.get('http://localhost:8088/stations/usage');
        stations.value = response.data;
        updateNearbyStations();
      } catch (error) {
        console.error('Error fetching station data:', error);
      } finally {
        loading.value = false;
      }
    };

    const updateNearbyStations = () => {
      const [lat, lon] = center.value;
      nearbyStations.value = stations.value.map(station => ({
        ...station,
        distance: calculateDistance(lat, lon, station.coordinatesY, station.coordinatesX)
      }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);
    };

    const getMarkerIcon = (usageLevel) => {
      const markerHtmlStyles = `
        background-color: ${getColorForUsageLevel(usageLevel)};
        width: 1rem;
        height: 1rem;
        display: block;
        left: -1rem;
        top: -1rem;
        position: relative;
        border-radius: 2rem 2rem 0;
        transform: rotate(45deg);
        border: 1px solid #FFFFFF;
        box-shadow: 0 0 4px rgba(0,0,0,0.5);`;

      return L.divIcon({
        className: "my-custom-pin",
        iconAnchor: [0, 16],
        labelAnchor: [-4, 0],
        popupAnchor: [0, -24],
        html: `<span style="${markerHtmlStyles}" />`
      });
    };

    const getColorForUsageLevel = (usageLevel) => {
      switch (usageLevel) {
        case 1: return '#4CAF50';
        case 2: return '#2196F3';
        case 3: return '#FF9800';
        case 4: return '#F44336';
        default: return '#9E9E9E';
      }
    };

    const goToStationDetails = (stationName) => {
      router.push(`/station/${stationName}`);
    };

    const searchLocation = async () => {
      if (!searchQuery.value) return;

      loading.value = true;
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}`);
        if (response.data && response.data.length > 0) {
          const { lat, lon } = response.data[0];
          center.value = [parseFloat(lat), parseFloat(lon)];
          zoom.value = 13;
          if (map.value) {
            map.value.leafletObject.flyTo(center.value, zoom.value);
          }
          searchedLocation.value = [parseFloat(lat), parseFloat(lon)]; // 使用新的变量名
          updateNearbyStations();
          hasSearched.value = true;
        } else {
          alert('Location not found');
        }
      } catch (error) {
        console.error('Error searching location:', error);
        alert('Error searching location');
      } finally {
        loading.value = false;
      }
    };

    const useCurrentLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async function (position) {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          center.value = [lat, lon];
          zoom.value = 13;
          if (map.value) {
            map.value.leafletObject.flyTo(center.value, zoom.value);
          }
          searchedLocation.value = [lat, lon]; // 使用新的变量名

          try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            if (response.data && response.data.display_name) {
              searchQuery.value = response.data.display_name;
            } else {
              searchQuery.value = `${lat}, ${lon}`;
            }
            updateNearbyStations();
            hasSearched.value = true;
          } catch (error) {
            console.error('Error getting address from coordinates:', error);
            searchQuery.value = `${lat}, ${lon}`;
          }
        }, function (error) {
          console.error("Error getting current location:", error);
          alert("Unable to retrieve your location. Please check your browser settings.");
        });
      } else {
        alert("Geolocation is not supported by your browser.");
      }
    };

    onMounted(() => {
      exploreNearbyStations();
    });

    return {
      stations,
      nearbyStations,
      center,
      zoom,
      loading,
      searchQuery,
      map,
      exploreNearbyStations,
      getMarkerIcon,
      goToStationDetails,
      searchLocation,
      useCurrentLocation,
      hasSearched,
      searchedLocation,
      searchLocation,
    };
  },
};
</script>

<style scoped>
.map-container {
  height: 500px;
  width: 100%;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.details-button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.details-button:hover {
  background-color: #45a049;
}

.search-container {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.search-container input {
  padding: 5px;
  width: 300px;
  margin-right: 10px;
}

.search-container button {
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  margin-right: 10px;
}

.search-container button:last-child {
  background-color: #2196F3;
}

.search-container button:hover {
  opacity: 0.8;
}

.nearby-stations {
  margin-top: 20px;
}

.nearby-stations table {
  width: 100%;
  border-collapse: collapse;
}

.nearby-stations th,
.nearby-stations td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.nearby-stations th {
  background-color: #f2f2f2;
}

.nearby-stations tr:nth-child(even) {
  background-color: #f9f9f9;
}
</style>