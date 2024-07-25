<template>
    <div class="station-details-page">
        <h1>Station Details: {{ stationName }}</h1>
        <div v-if="loading" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>Loading station details...</p>
        </div>
        <template v-else-if="stationDetails">
            <StationDetails :station="stationDetails" />
            <UsageChartSector :station="stationDetails" :connectorUsageData="connectorUsageData"
                :connectorTimePeriodData="connectorTimePeriodData" :currentScope="currentScope"
                @fetch-connector-usage-data="updateScope" />
            <WeeklyChartSector :weeklyUsageData="weeklyUsageData" />
            <HeatmapSector v-if="weeklyHourlyUsageData" :weeklyHourlyUsageData="weeklyHourlyUsageData" />
            <CityChartSector v-if="cityWeeklyUsageData" :cityWeeklyUsageData="cityWeeklyUsageData" />
        </template>
        <div v-else class="error">{{ error }}</div>
        <button @click="goBackToMap" class="back-button">Back to Map</button>

        <div class="floating-panel">
            <button @click="togglePanel('chargingEstimator')" class="toggle-button">
                {{ isPanelOpen.chargingEstimator ? 'Close' : 'Open' }} Charging Estimator
            </button>
            <div v-if="isPanelOpen.chargingEstimator" class="panel-content">
                <ChargingEstimator />
            </div>

            <button @click="togglePanel('routeEstimator')" class="toggle-button">
                {{ isPanelOpen.routeEstimator ? 'Close' : 'Open' }} Route Estimator
            </button>
            <div v-if="isPanelOpen.routeEstimator" class="panel-content">
                <RouteEstimator :destination-station="stationName" />
            </div>

            <button @click="togglePanel('availabilityPredictor')" class="toggle-button">
                {{ isPanelOpen.availabilityPredictor ? 'Close' : 'Open' }} Availability Predictor
            </button>
            <div v-if="isPanelOpen.availabilityPredictor" class="panel-content">
                <AvailabilityPredictor :station-name="stationName" />
            </div>
        </div>

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
import ChargingEstimator from '@/components/ChargingEstimator.vue';
import RouteEstimator from '@/components/RouteEstimator.vue';
import AvailabilityPredictor from '@/components/AvailabilityPredictor.vue';


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
        ChargingEstimator,
        RouteEstimator,
        AvailabilityPredictor

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

        const isPanelOpen = ref({
            chargingEstimator: false,
            routeEstimator: false
        });

        const togglePanel = (panelName) => {
            isPanelOpen.value[panelName] = !isPanelOpen.value[panelName];
        };

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
            goBackToMap,
            isPanelOpen,
            togglePanel,
        };
    }
};
</script>

<style scoped>
.station-details-page {
    padding: 20px 20px 20px 380px;
    /* 增加左侧padding，为浮动面板留出更多空间 */
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
}

.loading-overlay,
.error {
    text-align: center;
    margin-top: 20px;
    font-size: 18px;
}

.back-button {
    align-self: flex-start;
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

.back-button:hover {
    background-color: #45a049;
}

.floating-panel {
    position: fixed;
    left: 20px;
    top: 150px;
    /* 调整顶部位置 */
    width: 400px;
    z-index: 100;
    transition: all 0.3s ease;
    max-height: calc(100vh - 100px);
    /* 设置最大高度，留出一些空间 */
    display: flex;
    flex-direction: column;
    background-color: #f0f0f0;
    /* 添加背景色 */
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.toggle-button {
    width: 100%;
    padding: 10px;
    background-color: #8262f6;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 16px;
    text-align: center;
    transition: background-color 0.3s;
    margin-top: 10px;
}

.toggle-button:first-child {
    margin-top: 0;
    border-radius: 8px 8px 0 0;
}

.panel-content {
    background-color: #ffffff;
    border: 1px solid #ddd;
    border-top: none;
    padding: 15px;
    flex-grow: 1;
    overflow-y: auto;
    /* 允许内容滚动 */
    max-height: calc(100vh - 200px);
    /* 限制最大高度 */
}

.panel-content:last-child {
    border-radius: 0 0 8px 8px;
}

/* 自定义滚动条样式 */
.panel-content::-webkit-scrollbar {
    width: 8px;
}

.panel-content::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.panel-content::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
    background: #555;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .station-details-page {
        padding: 10px;
    }

    .floating-panel {
        position: fixed;
        left: 0;
        right: 0;
        top: auto;
        bottom: 0;
        width: 100%;
        max-height: 50vh;
        /* 在移动设备上限制最大高度 */
        border-radius: 8px 8px 0 0;
    }

    .toggle-button {
        border-radius: 0;
    }

    .toggle-button:first-child {
        border-radius: 8px 8px 0 0;
    }

    .panel-content {
        border-radius: 0;
    }

    .station-details-page {
        margin-bottom: 60px;
        /* 为底部按钮留出空间 */
    }
}

/* 添加一些通用的样式来改善整体布局 */
h1 {
    color: #333;
    margin-bottom: 20px;
}

.section {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.section h2 {
    color: #4CAF50;
    margin-top: 0;
}
</style>