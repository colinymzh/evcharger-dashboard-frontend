<template>
    <div class="station-details-page">
      <h1>Station Details: {{ stationName }}</h1>
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Loading station details...</p>
      </div>
      <template v-else-if="stationDetails">
        <StationDetails :station="stationDetails" />
        <UsageChartSector 
          :station="stationDetails" 
          :connectorUsageData="connectorUsageData"
          :connectorTimePeriodData="connectorTimePeriodData" 
          :currentScope="currentScope"
          @fetch-connector-usage-data="updateScope" 
        />
        <WeeklyChartSector :weeklyUsageData="weeklyUsageData" />
        <HeatmapSector v-if="weeklyHourlyUsageData" :weeklyHourlyUsageData="weeklyHourlyUsageData" />
        <CityChartSector v-if="cityWeeklyUsageData" :cityWeeklyUsageData="cityWeeklyUsageData" />
      </template>
      <div v-else class="error">{{ error }}</div>
      <button @click="goBackToMap" class="back-button">Back to Map</button>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import axios from 'axios';
  import StationDetails from '@/components/StationDetails.vue';
  import UsageChartSector from '@/components/UsageChartSector.vue';
  import WeeklyChartSector from '@/components/WeeklyChartSector.vue';
  import HeatmapSector from '@/components/HeatmapSector.vue';
  import CityChartSector from '@/components/CityChartSector.vue';
  
  const API_BASE_URL = 'http://localhost:8088';
  
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
    name: 'StationDetailsPage',
    components: {
      StationDetails,
      UsageChartSector,
      WeeklyChartSector,
      HeatmapSector,
      CityChartSector,
    },
    setup() {
      const route = useRoute();
      const router = useRouter();
      const stationName = ref(route.params.stationName);
      const stationDetails = ref(null);
      const loading = ref(true);
      const error = ref(null);
      const connectorUsageData = ref(null);
      const connectorTimePeriodData = ref(null);
      const weeklyUsageData = ref(null);
      const cityWeeklyUsageData = ref(null);
      const weeklyHourlyUsageData = ref(null);
      const currentScope = ref(5);
  
      const fetchStationDetails = async (scope = 5) => {
        loading.value = true;
        try {
          const [
            stationData,
            usageData,
            timePeriodData,
            weeklyUsage,
            cityWeeklyUsage,
            weeklyHourlyUsage
          ] = await Promise.all([
            fetchData(`${API_BASE_URL}/stations/${stationName.value}`),
            fetchData(`${API_BASE_URL}/availability/station/usage`, { stationName: stationName.value, scope }),
            fetchData(`${API_BASE_URL}/availability/station/usage/time-period`, { stationName: stationName.value, scope }),
            fetchData(`${API_BASE_URL}/availability/station/weekly-usage`, { stationName: stationName.value }),
            fetchData(`${API_BASE_URL}/availability/city/weekly-usage`, { stationName: stationName.value }),
            fetchData(`${API_BASE_URL}/availability/station/weekly-hourly-usage`, { stationName: stationName.value })
          ]);
  
          stationDetails.value = stationData;
          connectorUsageData.value = usageData;
          connectorTimePeriodData.value = timePeriodData;
          weeklyUsageData.value = weeklyUsage;
          cityWeeklyUsageData.value = cityWeeklyUsage;
          weeklyHourlyUsageData.value = weeklyHourlyUsage;
          currentScope.value = scope;
        } catch (err) {
          error.value = "Failed to load station details. Please try again later.";
          console.error('Error fetching station details:', err);
        } finally {
          loading.value = false;
        }
      };
  
      const updateScope = (newScope) => {
        fetchStationDetails(newScope);
      };
  
      const goBackToMap = () => {
        router.push('/map');
      };
  
      onMounted(() => fetchStationDetails());
  
      return {
        stationName,
        stationDetails,
        loading,
        error,
        connectorUsageData,
        connectorTimePeriodData,
        weeklyUsageData,
        cityWeeklyUsageData,
        weeklyHourlyUsageData,
        currentScope,
        updateScope,
        goBackToMap
      };
    }
  };
  </script>
  
  <style scoped>
  .station-details-page {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .loading-overlay, .error {
    text-align: center;
    margin-top: 20px;
    font-size: 18px;
  }
  
  
  .back-button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  
  .back-button:hover {
    background-color: #45a049;
  }
  </style>