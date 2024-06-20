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
                        <a href="#" @click.prevent="fetchStationDetails(station.stationName)">{{ station.stationName
                            }}</a>
                    </td>
                    <td>{{ station.cityName }}</td>
                    <td>{{ station.street }}</td>
                    <td>{{ station.postcode }}</td>
                </tr>
            </tbody>
        </table>
        <div class="selected-stations-grid" v-if="selectedStations.length > 0">
            <div class="station-card" v-for="(station, index) in selectedStations" :key="index">
                <p><strong>Station Name:</strong> {{ station.stationName }}</p>
                <p><strong>City:</strong> {{ station.cityName }}</p>
                <p><strong>Street:</strong> {{ station.street }}</p>
                <p><strong>Postcode:</strong> {{ station.postcode }}</p>
            </div>
        </div>

        <div class="button-container">
            <button @click="clearAllSelections" v-if="selectedStations.length > 0">Clear All</button>
            <button @click="checkAvailability" v-if="selectedStations.length > 0" class="green-button">Check
                Availability</button>
        </div>




        <div v-if="showModal" class="modal">
            <div class="modal-content">
                <span class="close" @click="closeModal">&times;</span>
                <h2>Station Name: {{ selectedStation.stationName }}</h2>
                <p><strong>City:</strong> {{ selectedStation.cityName }}</p>
                <p><strong>Street:</strong> {{ selectedStation.street }}</p>
                <p><strong>Postcode:</strong> {{ selectedStation.postcode }}</p>

                <h3>Tariff Information:</h3>
                <table>
                    <tbody>
                        <tr>
                            <th>Tariff Amount</th>
                            <td>{{ selectedStation.tariffAmount }}</td>
                        </tr>
                        <tr>
                            <th>Tariff Description</th>
                            <td>{{ selectedStation.tariffDescription }}</td>
                        </tr>
                        <tr>
                            <th>Tariff Connection Fee</th>
                            <td>{{ selectedStation.tariffConnectionfee || 'N/A' }}</td>
                        </tr>
                    </tbody>
                </table>


                <h3>Connectors:</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Connector ID</th>
                            <th>Max Charge Rate</th>
                            <th>Plug Type</th>
                            <th>Connector Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="connector in selectedStation.connectors" :key="connector.connectorId">
                            <td>{{ connector.connectorId }}</td>
                            <td>{{ connector.maxChargerate }} kW</td>
                            <td>{{ connector.plugType }}</td>
                            <td>{{ connector.connectorType }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>


        <div v-if="showAvailabilityModal" class="modal">
            <div class="modal-content">
                <span class="close" @click="showAvailabilityModal = false">&times;</span>
                <h2>Availability Data</h2>
                <div v-if="availabilityData" class="availability-data">
                    <div v-for="(chargePoint, index) in availabilityData" :key="index" class="charge-point">
                        <h3><i class="fas fa-charging-station"></i> Charge Point: {{ chargePoint.chargePoint.name }}
                        </h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Connector ID</th>
                                    <th>Connector Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template
                                    v-for="(connectorGroup, groupIndex) in chargePoint.chargePoint.connectorGroups">
                                    <tr v-for="(connector, connectorIndex) in connectorGroup.connectors"
                                        :key="`${groupIndex}-${connectorIndex}`">
                                        <td>{{ connector.connectorID }}</td>
                                        <td>
                                            {{ connector.connectorStatus }}<span
                                                :class="getStatusColor(connector.connectorStatus)"></span>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                        <div
                            v-if="!chargePoint.chargePoint.connectorGroups || chargePoint.chargePoint.connectorGroups.length === 0">
                            <p>No connectors available for this charge point.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>




        <div v-if="loading" class="loading-overlay">
            <div class="loading-spinner"></div>
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
            availabilityData: null,
            showAvailabilityModal: false,
            loading: false,
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

        async checkAvailability() {
            this.loading = true; // 开始加载
            const selectedStationNames = this.selectedStations.map(station => station.stationName);
            const url = 'https://account.chargeplacescotland.org/api/v2/poi/chargepoint/dynamic';
            const headers = {
                'api-auth': 'c3VwcG9ydCtjcHNhcHBAdmVyc2FudHVzLmNvLnVrOmt5YlRYJkZPJCEzcVBOJHlhMVgj',
                'chargePointIDs': selectedStationNames.join(',')
            };

            try {
                const response = await axios.get(url, { headers });
                console.log('Response:', response);
                console.log('Availability Data:', response.data.chargePoints);

                this.availabilityData = response.data.chargePoints;
                this.showAvailabilityModal = true; // 显示模态框

                this.$nextTick(() => {
                    console.log(this.availabilityData);
                });

            } catch (error) {
                console.error('Failed to fetch availability data:', error);
            }

            this.loading = false; // 加载完成
        },



        getStatusColor(status) {
            switch (status) {
                case 'AVAILABLE':
                    return 'status-available';
                case 'OCCUPIED':
                    return 'status-occupied';
                default:
                    return 'status-unknown';
            }
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

th,
td {
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
    border: 1px solid #f0f8ee;
    border-radius: 4px;
    padding: 10px;
    background-color: #e7f8e7;
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

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

th,
td {
    border: 1px solid #bcc4bc;
    padding: 8px;
    text-align: left;
}

th {
    background-color: #f2f2f2;
}

.button-container {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}


.status-available,
.status-occupied,
.status-unknown {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-left: 5px;
    vertical-align: middle;
}

.status-available {
    background-color: green;
}

.status-occupied {
    background-color: red;
}

.status-unknown {
    background-color: gray;
}


.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 3px solid #fff;
    border-top-color: #888;
    animation: spin 1s infinite linear;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}


.green-button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 4px;
}

.green-button:hover {
    background-color: #1c7921;
}

a {
  color: #1e8557; /* 将超链接的颜色设置为你喜欢的颜色 */
  text-decoration: none; /* 可选:移除默认的下划线 */
}

a:hover {
  text-decoration: underline; /* 可选:在鼠标悬停时添加下划线 */
}
</style>