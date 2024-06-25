<template>
    <div class="home">
        <div class="top-section">
            <div class="left-section">
                <div class="search-container">
                    <div class="status-message">
                        <font-awesome-icon :icon="['fas', 'charging-station']" />
                        Find a charging station
                        <button type="button" @click="clearSearchParams">Clear Filter</button>
                    </div>

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

            <div class="right-section">
                <div v-if="!selectedStation" class="prompt-text">
                    <font-awesome-icon :icon="['fas', 'charging-station']" />
                    Click Station Name to view charging station details
                </div>
                <StationDetails v-else :station="selectedStation" :connectorUsageData="connectorUsageData"
                    @fetch-connector-usage-data="handleFetchConnectorUsageData" />
            </div>
        </div>
        <div class="bottom-section">
            <div v-if="!selectedStation" class="prompt-text">
                    <font-awesome-icon :icon="['fas', 'charging-station']" />
                    Click Station Name to view charts
                </div>
            <ChartSector v-if="selectedStation" :station="selectedStation" :connectorUsageData="connectorUsageData"
                @fetch-connector-usage-data="handleFetchConnectorUsageData" />
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
import ChartSector from '@/components/ChartSector.vue';
library.add(faChargingStation)

export default {
    name: 'Home',
    components: {
        ChargingStationTable,
        FontAwesomeIcon,
        StationDetails,
        ChartSector,
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
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.totalStations / this.pageSize);
        },
    },
    watch: {
        searchParams: {
            handler: 'fetchData',
            deep: true,
        },
    },
    methods: {
        async fetchStationDetails(stationName) {
            try {
                // 重置 connectorUsageData
                this.connectorUsageData = null;

                const response = await axios.get(`http://localhost:8088/stations/${stationName}`);
                this.selectedStation = response.data;

                const usageResponse = await axios.get(`http://localhost:8088/availability/station/usage?stationName=${stationName}&scope=5`);
                this.connectorUsageData = usageResponse.data;
            } catch (error) {
                console.error('Failed to fetch station details:', error);
            }
        },

        handleFetchConnectorUsageData(scope) {
            this.fetchStationDetailsWithScope(this.selectedStation.stationName, scope);
        },

        async fetchStationDetailsWithScope(stationName, scope) {
            try {
                // 重置 connectorUsageData
                this.connectorUsageData = null;

                const response = await axios.get(`http://localhost:8088/stations/${stationName}`);
                this.selectedStation = response.data;

                const usageResponse = await axios.get(`http://localhost:8088/availability/station/usage?stationName=${stationName}&scope=${scope}`);
                this.connectorUsageData = usageResponse.data;
            } catch (error) {
                console.error('Failed to fetch station details:', error);
            }
        },

        async fetchData() {
            try {
                const params = {
                    page: this.currentPage,
                    size: this.pageSize,
                };

                if (this.searchParams.cityName) {
                    params.cityName = this.searchParams.cityName;
                }

                if (this.searchParams.postcode) {
                    params.postcode = this.searchParams.postcode;
                }

                if (this.searchParams.supportsFastCharging) {
                    params.supportsFastCharging = true;
                }

                const response = await axios.get('http://localhost:8088/stations/filtered', {
                    params,
                });

                this.stations = response.data.records;
                this.totalStations = response.data.total;
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        },
        async fetchCities() {
            try {
                const response = await axios.get('http://localhost:8088/sites/cities');
                this.cities = response.data.sort();
            } catch (error) {
                console.error('Failed to fetch cities:', error);
            }
        },
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
            this.searchParams.cityName = '';
            this.searchParams.postcode = '';
            this.searchParams.supportsFastCharging = false;
            this.currentPage = 1;
            this.fetchData();
        },
    },
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
    width: 80%;
    padding-right: 20px;
}

.right-section {
    width: 30%;
    padding-left: 20px;
    display: flex;
    /* 添加这一行 */
    justify-content: center;
    /* 添加这一行 */
    align-items: center;
    /* 添加这一行 */
}

.bottom-section {
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 其他样式保持不变 */


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
</style>