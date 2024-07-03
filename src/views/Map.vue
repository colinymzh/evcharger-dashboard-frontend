<template>
    <div>
      <button @click="exploreNearbyStations" class="explore-button">Explore nearby charging stations</button>
    </div>
  
    <div class="map">
      <Map />
    </div>
  </template>
  
  <script>
  import Map from '@/components/Map.vue';
  
  export default {
    name: 'Map',
    components: {
      Map,
    },
  };
  </script>
  
  <style scoped>
  .map {
    padding: 2rem;
  }
  
  h2 {
    color: #24af50;
    font-family: 'Arial', sans-serif;
    font-weight: bold;
    text-align: center;
    margin-bottom: 1rem;
  }
  
  .explore-button {
    background-color: #24af50;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    transition-duration: 0.4s;
    cursor: pointer;
    margin-bottom: 1rem;
  }
  
  .explore-button:hover {
    background-color: #1e8e41;
  }
  </style>