<template>
    <div v-if="station">

        <h2>{{ station.cityName }}</h2>
        <p>Station Name: {{ station.stationName }}</p>
        <p><strong>Street:</strong> {{ station.street }}</p>
        <p><strong>Postcode:</strong> {{ station.postcode }}</p>

        <h3>Tariff Information:</h3>
        <table>
            <tbody>
                <tr>
                    <th>Tariff Amount</th>
                    <td>{{ station.tariffAmount }}</td>
                </tr>
                <tr>
                    <th>Tariff Description</th>
                    <td>{{ station.tariffDescription }}</td>
                </tr>
                <tr>
                    <th>Tariff Connection Fee</th>
                    <td>{{ station.tariffConnectionfee || 'N/A' }}</td>
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
                <tr v-for="connector in station.connectors" :key="connector.connectorId">
                    <td>{{ connector.connectorId }}</td>
                    <td>{{ connector.maxChargerate }} kW</td>
                    <td>{{ connector.plugType }}</td>
                    <td>{{ connector.connectorType }}</td>
                </tr>
            </tbody>
        </table>


        <button @click="navigateToAvailabilityPage">Check Historical Availability</button>
    </div>
</template>

<script>
export default {
    name: 'StationDetails',
    props: {
        station: {
            type: Object,
            required: true,
        },
    },

    methods: {
        navigateToAvailabilityPage() {
            const stationName = this.station.stationName;
            this.$router.push(`/availability/${stationName}`);
        },
    },
};
</script>


<style scoped>
.station-details {
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-family: Arial, sans-serif;
}

h2 {
    color: #277734;
    font-size: 24px;
    margin-bottom: 10px;
}

p {
    color: #555;
    margin-bottom: 10px;
}

h3 {
    color: #277734;
    font-size: 18px;
    margin-top: 20px;
    margin-bottom: 10px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

th,
td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

th {
    background-color: #f2f2f2;
    color: #555;
    font-weight: bold;
}

tr:hover {
    background-color: #f5f5f5;
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
</style>