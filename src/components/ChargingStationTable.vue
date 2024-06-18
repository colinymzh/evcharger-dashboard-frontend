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
            <td>{{ station.stationName }}</td>
            <td>{{ station.city }}</td>
            <td>{{ station.street }}</td>
            <td>{{ station.postcode }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ChargingStationTable',
    props: {
      stations: {
        type: Array,
        required: true,
      },
    },
  };
  </script>
  
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
  </style>