<template>
    <div id="map-container">
      <l-map ref="map" v-model:zoom="zoom" :center="center">
        <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
      </l-map>
    </div>
  </template>
  
  <script>
  import { LMap, LTileLayer } from '@vue-leaflet/vue-leaflet';
  import 'leaflet/dist/leaflet.css';
  
  export default {
    name: 'Map',
    components: {
      LMap,
      LTileLayer,
    },
    data() {
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution:
          '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        zoom: 7,
        center: [56.4907, -4.2026], // 苏格兰中心坐标
      };
    },
  };
  </script>
  
  <style scoped>
  #map-container {
    width: 60%;
    height: 400px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin: 0 auto;
  }
  </style>