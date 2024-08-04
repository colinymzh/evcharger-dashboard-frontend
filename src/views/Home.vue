<template>
    <div class="home">
        <div class="top-section">
            <div class="left-section">
                <!-- Search and filter section -->
                <div class="search-container">
                    <div class="status-message">
                        <font-awesome-icon :icon="['fas', 'charging-station']" />
                        Find a charging station
                        <button type="button" @click="clearSearchParams">Clear Filter</button>
                    </div>

                    <!-- Search form -->
                    <form @submit.prevent="searchStations">
                        <input type="text" list="cities" v-model="searchParams.cityName" @input="searchStations"
                            placeholder="Select or type a city" />
                        <datalist id="cities">
                            <option value="">All Cities</option>
                            <option v-for="cityName in cities" :key="cityName" :value="cityName">{{ cityName }}</option>
                        </datalist>
                        <input type="text" v-model="searchParams.postcode" placeholder="Postcode" />
                        <label>
                            <input type="checkbox" v-model="searchParams.supportsFastCharging" />
                            Supports Fast Charging
                        </label>
                    </form>
                </div>

                <!-- Table displaying charging stations -->
                <div class="table-container">
                    <ChargingStationTable :stations="stations" @station-clicked="fetchStationDetails" />
                    <div class="pagination">
                        <button @click="goToFirstPage" :disabled="currentPage === 1">First Page</button>
                        <button @click="prevPage" :disabled="currentPage === 1">Last Page</button>
                        <span>{{ currentPage }} / {{ totalPages }}</span>
                        <button @click="nextPage" :disabled="currentPage === totalPages">Next Page</button>
                        <div class="goto-page">
                            Go To: <input type="number" v-model.number="gotoPage" @keyup.enter="goToPage" min="1"
                                :max="totalPages" />
                        </div>
                        <div class="page-size">
                            Every Page:
                            <select v-model="pageSize" @change="changePageSize">
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>


        </div>
        <div class="bottom-section">
            <!-- Prompt when no station is selected -->
            <div v-if="!selectedStation && !loading" class="prompt-text">
                <font-awesome-icon :icon="['fas', 'charging-station']" />
                Click Station Name to View Charging Station Details
            </div>
            <!-- Loading overlay -->
            <div v-else-if="loading" class="loading-overlay">
                <div class="loading-spinner"></div>
                <p>Loading station details...</p>
            </div>
            <!-- Station details and charts when a station is selected -->
            <template v-else>
                <StationDetails :station="selectedStation" />
                <UsageChartSector :station="selectedStation" :connectorUsageData="connectorUsageData"
                    :connectorTimePeriodData="connectorTimePeriodData" :currentScope="currentScope"
                    @fetch-connector-usage-data="updateScope" />
                <WeeklyChartSector :weeklyUsageData="weeklyUsageData" />
                <HeatmapSector v-if="weeklyHourlyUsageData" :weeklyHourlyUsageData="weeklyHourlyUsageData" />
                <CityChartSector v-if="cityWeeklyUsageData" :cityWeeklyUsageData="cityWeeklyUsageData" />
            </template>
        </div>
    </div>
</template>

<script>
import ChargingStationTable from '@/components/ChargingStationTable.vue';
import StationDetails from '@/components/StationDetails.vue';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChargingStation } from '@fortawesome/free-solid-svg-icons';
import UsageChartSector from '@/components/UsageChartSector.vue';
import WeeklyChartSector from '@/components/WeeklyChartSector.vue';
library.add(faChargingStation)
import CityChartSector from '@/components/CityChartSector.vue';
import HeatmapSector from '@/components/HeatmapSector.vue';

// Define the base URL for API requests
const API_BASE_URL = 'http://localhost:8088';

// Helper function to fetch data from the API
const fetchData = async (url, params = {}) => {
    try {
        const response = await axios.get(url, { params });
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch data from ${url}:`, error);
        throw error;
    }
};

export default {
    name: 'Home',
    components: {
        ChargingStationTable,
        FontAwesomeIcon,
        StationDetails,
        UsageChartSector,
        WeeklyChartSector,
        CityChartSector,
        HeatmapSector,

    },
    data() {
        return {
            stations: [],
            selectedStation: null,
            currentPage: 1,
            pageSize: 10,
            totalStations: 0,
            gotoPage: 1,
            searchParams: {
                cityName: '',
                postcode: '',
                supportsFastCharging: false,
            },
            cities: [],
            connectorUsageData: null,
            connectorTimePeriodData: null,
            weeklyUsageData: null,
            cityWeeklyUsageData: null,
            weeklyHourlyUsageData: null,
            loading: false,
            currentScope: 5,
        };
    },
    computed: {
        // Calculate total pages based on total stations and page size
        totalPages() {
            return Math.ceil(this.totalStations / this.pageSize);
        },
    },
    watch: {
        // Watch for changes in search parameters and fetch data accordingly
        searchParams: {
            handler: 'fetchData',
            deep: true,
        },
    },
    methods: {
        // Fetch detailed information for a selected station
        async fetchStationDetails(stationName, scope = 5) {
            this.loading = true;
            this.connectorUsageData = null;
            this.cityWeeklyUsageData = null;
            this.weeklyHourlyUsageData = null;
            this.selectedStation = null;
            this.currentScope = scope;  

            try {
                // Fetch multiple data sets concurrently
                const [stationData, usageData, timePeriodData, weeklyUsageData, cityWeeklyUsageData, weeklyHourlyUsageData] = await Promise.all([
                    this.fetchStationData(stationName),
                    this.fetchUsageData(stationName, scope),
                    this.fetchTimePeriodData(stationName, scope),
                    this.fetchWeeklyUsageData(stationName),
                    this.fetchCityWeeklyUsageData(stationName),
                    this.fetchWeeklyHourlyUsageData(stationName)
                ]);

                // Update component data with fetched information
                this.selectedStation = stationData;
                this.connectorUsageData = usageData;
                this.connectorTimePeriodData = timePeriodData;
                this.weeklyUsageData = weeklyUsageData;
                this.cityWeeklyUsageData = cityWeeklyUsageData;
                this.weeklyHourlyUsageData = weeklyHourlyUsageData;
            } catch (error) {
                console.error('Failed to fetch station details:', error);
            } finally {
                this.loading = false;
            }
        },

        // Update the scope and refetch station details
        updateScope(newScope) {
            if (this.selectedStation) {
                this.fetchStationDetails(this.selectedStation.stationName, newScope);
            }
        },

        // Helper methods to fetch different types of data
        fetchStationData(stationName) {
            return fetchData(`${API_BASE_URL}/stations/${stationName}`);
        },

        fetchUsageData(stationName, scope) {
            return fetchData(`${API_BASE_URL}/availability/station/usage`, { stationName, scope });
        },

        fetchTimePeriodData(stationName, scope) {
            return fetchData(`${API_BASE_URL}/availability/station/usage/time-period`, { stationName, scope });
        },

        fetchWeeklyUsageData(stationName) {
            return fetchData(`${API_BASE_URL}/availability/station/weekly-usage`, { stationName });
        },

        fetchCityWeeklyUsageData(stationName) {
            return fetchData(`${API_BASE_URL}/availability/city/weekly-usage`, { stationName });
        },

        fetchWeeklyHourlyUsageData(stationName) {
            return fetchData(`${API_BASE_URL}/availability/station/weekly-hourly-usage`, { stationName });
        },

        // Fetch stations data based on current page, page size, and search parameters
        async fetchData() {
            try {
                const params = {
                    page: this.currentPage,
                    size: this.pageSize,
                    ...this.getSearchParams()
                };

                const data = await fetchData(`${API_BASE_URL}/stations/filtered`, params);

                this.stations = data.records;
                this.totalStations = data.total;
            } catch (error) {
                console.error('Failed to fetch station data:', error);
            }
        },

        // Fetch list of cities for the city dropdown
        async fetchCities() {
            try {
                const cities = await fetchData(`${API_BASE_URL}/sites/cities`);
                this.cities = cities.sort();
            } catch (error) {
                console.error('Failed to fetch cities:', error);
            }
        },

        // Helper method to get search parameters
        getSearchParams() {
            const params = {};
            const { cityName, postcode, supportsFastCharging } = this.searchParams;

            if (cityName) params.cityName = cityName;
            if (postcode) params.postcode = postcode;
            if (supportsFastCharging) params.supportsFastCharging = true;

            return params;
        },

        // Pagination methods
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.fetchData();
            }
        },

        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.fetchData();
            }
        },

        goToFirstPage() {
            this.currentPage = 1;
            this.fetchData();
        },

        goToPage() {
            if (this.gotoPage >= 1 && this.gotoPage <= this.totalPages) {
                this.currentPage = this.gotoPage;
                this.fetchData();
            }
        },

        changePageSize() {
            this.currentPage = 1;
            this.fetchData();
        },

        searchStations() {
            this.currentPage = 1;
            this.fetchData();
        },

        clearSearchParams() {
            this.searchParams = {
                cityName: '',
                postcode: '',
                supportsFastCharging: false
            };
            this.currentPage = 1;
            this.fetchData();
        },
    },
    // Lifecycle hook to fetch initial data when component is created
    created() {
        this.fetchData();
        this.fetchCities();
    },
};
</script>

<style scoped>
.home {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 20px;
}

.top-section {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: stretch;
    margin-bottom: 20px;

}

.left-section {
    width: 100%;
    padding-right: 20px;
}

.right-section {
    width: 30%;
    padding-left: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.bottom-section {
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}



.header {
    text-align: center;
    margin-bottom: 20px;
}

h1 {
    font-size: 24px;
    margin-bottom: 20px;
}

button {
    padding: 10px 20px;
    font-size: 16px;
    color: white;
    background-color: #42b983;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 20px;
}

button:hover {
    background-color: #2c3e50;
}





.table-container {
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
}

.pagination button {
    margin: 0 10px;
}

.goto-page,
.page-size {
    margin-left: 20px;
}

.goto-page input {
    width: 50px;
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.search-container {
    margin-bottom: 20px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-container form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
}

.search-container input[type='text'],
.search-container button {
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 16px;
}

.search-container input[type='text'] {
    flex: 1;
    min-width: 200px;
}

.search-container button {
    background-color: #24af50;
    color: #fff;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.search-container button:hover {
    background-color: #0056b3;
}

.search-container label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 16px;
}

.search-container input[type='checkbox'] {
    width: 18px;
    height: 18px;
}

.status-message {
    font-size: 18px;
    color: #277734;
    border-radius: 8px;
    margin: 20px auto;
    width: 100%;
    text-align: left;
    display: block;
}

.prompt-text {
    text-align: center;
    padding: 20px;
    color: #555;
    font-size: 16px;
    margin: auto;
    color: #277734;
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
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
</style>