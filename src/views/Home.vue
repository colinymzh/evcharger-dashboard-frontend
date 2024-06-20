<template>
    <div class="home">
        <div class="search-container">
            <div class="status-message">
                <font-awesome-icon :icon="['fas', 'charging-station']" />
                Find a charging station
                <button type="button" @click="clearSearchParams">Clear Filter</button>
            </div>

            <form @submit.prevent="searchStations">
                <input type="text" list="cities" v-model="searchParams.cityName" @input="searchStations"
                    placeholder="Select or type a city">
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

            <div class="status-message">
                <font-awesome-icon :icon="['fas', 'charging-station']" />
                Click Station Name to view charging station details
            </div>
            <div class="status-message">
                <font-awesome-icon :icon="['fas', 'charging-station']" />
                Select a charging station to check if it is currently available
            </div>
            <ChargingStationTable :stations="stations" />
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
</template>

<script>
import ChargingStationTable from '@/components/ChargingStationTable.vue';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChargingStation } from '@fortawesome/free-solid-svg-icons';
library.add(faChargingStation)

export default {
    name: 'Home',
    components: {
        ChargingStationTable,
        FontAwesomeIcon,
    },
    data() {
        return {
            stations: [],
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

                const response = await axios.get('http://localhost:8080/stations/filtered', {
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
                const response = await axios.get('http://localhost:8080/sites/cities');
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
    align-items: center;
    padding: 20px;
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
    width: 60%;
    /* 修改这一行 */
    padding: 20px;
    margin: 10px auto 40px;
    /* 修改这一行 */
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
    width: 60%;
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
    /* 字体大小 */
    color: #277734;
    /* 字体颜色，深蓝灰色 */
    border-radius: 8px;
    /* 边框圆角 */
    margin: 20px auto;
    /* 自动边距使其居中显示，上下边距20px */
    width: 100%;
    /* 宽度，根据需要调整 */
    text-align: left;
    display: block;
    /* 设置为块级元素 */
}
</style>