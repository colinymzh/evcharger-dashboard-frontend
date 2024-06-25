<template>
    <div>
        <table>
            <thead>
                <tr>
                    <th>Station Name</th>
                    <th>City</th>
                    <th>Street</th>
                    <th>Postcode</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="station in stations" :key="station.stationName">
                    <td>
          <a href="#" @click.prevent="$emit('station-clicked', station.stationName)">{{ station.stationName }}</a>
        </td>
                    <td>{{ station.cityName }}</td>
                    <td>{{ station.street }}</td>
                    <td>{{ station.postcode }}</td>
                </tr>
            </tbody>
        </table>

        <StationDetails :station="selectedStation" />
    </div>
</template>

<script>
import axios from 'axios';
import StationDetails from './StationDetails.vue';

export default {
    name: 'ChargingStationTable',

    components: {
        StationDetails,
    },
    props: {
        stations: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            selectedStation: null,
            availabilityData: null,
            showAvailabilityModal: false,
            loading: false,
        };
    },
    methods: {

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
    color: #1e8557;
    /* 将超链接的颜色设置为你喜欢的颜色 */
    text-decoration: none;
    /* 可选:移除默认的下划线 */
}

a:hover {
    text-decoration: underline;
    /* 可选:在鼠标悬停时添加下划线 */
}
</style>