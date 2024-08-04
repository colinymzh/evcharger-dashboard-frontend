<template>
    <div class="route-estimator">
        <h3>Route Estimator</h3>
        <!-- Input form for route estimation -->
        <div class="form-group">
            <label for="startLocation">Starting Point:</label>
            <input id="startLocation" v-model="startLocation"
                placeholder="Enter address, postal code, or use current location">
            <button @click="useCurrentLocation" class="use-location-btn">Use Current Location</button>
        </div>
        <div class="form-group">
            <label for="destinationStation">Destination Station:</label>
            <input id="destinationStation" v-model="destinationStation" placeholder="Enter station name">
        </div>
        <div class="form-group">
            <label for="currentCharge">Current Battery Charge (%):</label>
            <input id="currentCharge" v-model="currentCharge" type="number" min="0" max="100">
        </div>
        <div class="form-group">
            <label for="batteryCapacity">Battery Capacity (kWh):</label>
            <input id="batteryCapacity" v-model="batteryCapacity" type="number" min="0">
        </div>
        <div class="form-group">
            <label for="energyConsumption">Energy Consumption (kWh/100km):</label>
            <input id="energyConsumption" v-model="energyConsumption" type="number" min="0">
        </div>
        <button @click="estimateRoute" class="estimate-btn">Estimate Route</button>

        <!-- Display route information after estimation -->
        <div v-if="routeInfo" class="route-info">
            <h4>Route Information:</h4>
            <p>Distance: {{ (routeInfo.distance / 1000).toFixed(2) }} km</p>
            <p>Duration: {{ formatDuration(routeInfo.duration) }}</p>
            <p>Can reach destination: {{ canReachDestination ? 'Yes' : 'No' }}</p>
            <p v-if="!canReachDestination" class="warning">Warning: You may not have enough charge to reach the
                destination.</p>
        </div>
    </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import axios from 'axios';

export default {
    name: 'RouteEstimator',
    props: {
        destinationStation: {
            type: String,
            default: ''
        }
    },
    setup(props) {
        // Reactive references for form inputs
        const startLocation = ref('');
        const destinationStation = ref(props.destinationStation);
        const currentCharge = ref(80);
        const batteryCapacity = ref(50);
        const energyConsumption = ref(15);
        const routeInfo = ref(null);

        // Watch for changes in the destinationStation prop
        watch(() => props.destinationStation, (newValue) => {
            destinationStation.value = newValue;
        });

        // Function to use the user's current location
        const useCurrentLocation = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((position) => {
                    startLocation.value = `${position.coords.latitude},${position.coords.longitude}`;
                });
            } else {
                alert("Geolocation is not available in your browser.");
            }
        };

        // Function to geocode an address to coordinates
        const geocodeAddress = async (address) => {
            try {
                const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                    params: {
                        q: address,
                        format: 'json',
                        limit: 1
                    }
                });
                if (response.data && response.data.length > 0) {
                    return {
                        lat: response.data[0].lat,
                        lon: response.data[0].lon
                    };
                }
                throw new Error('No results found');
            } catch (error) {
                console.error('Geocoding error:', error);
                throw error;
            }
        };

        // Function to estimate the route
        const estimateRoute = async () => {
            try {
                let lat, lon;
                if (startLocation.value.includes(',')) {
                    [lat, lon] = startLocation.value.split(',');
                } else {
                    const geoResult = await geocodeAddress(startLocation.value);
                    lat = geoResult.lat;
                    lon = geoResult.lon;
                }

                const response = await axios.get(`http://localhost:8088/route/summary`, {
                    params: {
                        startY: lat,
                        startX: lon,
                        stationName: destinationStation.value
                    }
                });
                routeInfo.value = response.data;
            } catch (error) {
                console.error('Error fetching route information:', error);
                alert('Failed to fetch route information. Please try again.');
            }
        };

        // Computed property to determine if the destination can be reached
        const canReachDestination = computed(() => {
            if (!routeInfo.value) return false;
            const distanceKm = routeInfo.value.distance / 1000;
            const estimatedConsumption = (distanceKm / 100) * energyConsumption.value;
            const availableEnergy = (currentCharge.value / 100) * batteryCapacity.value;
            return availableEnergy >= estimatedConsumption;
        });

        // Helper function to format duration in hours and minutes
        const formatDuration = (seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours} hours ${minutes} minutes`;
        };

        return {
            startLocation,
            destinationStation,
            currentCharge,
            batteryCapacity,
            energyConsumption,
            routeInfo,
            useCurrentLocation,
            estimateRoute,
            canReachDestination,
            formatDuration
        };
    }
};
</script>

<style scoped>
.route-estimator {
    padding: 20px;
    background-color: #f5f5f5;
    border-radius: 8px;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
}

input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.use-location-btn,
.estimate-btn {
    margin-top: 10px;
    padding: 8px 15px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.route-info {
    margin-top: 20px;
    padding: 15px;
    background-color: #e9e9e9;
    border-radius: 4px;
}

.warning {
    color: red;
    font-weight: bold;
}
</style>