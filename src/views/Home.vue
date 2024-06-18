<template>
    <div class="home">


        <div class="search-container">
            <form @submit.prevent="searchStations">
                <input type="text" v-model="searchParams.city" placeholder="City" />
                <input type="text" v-model="searchParams.postcode" placeholder="Postcode" />
                <label>
                    <input type="checkbox" v-model="searchParams.supportsFastCharging" />
                    Supports Fast Charging
                </label>
                <button type="button" @click="clearSearchParams">Clear</button>
            </form>
        </div>



        <div class="table-container">
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

        <div class="header">
            <button @click="exploreNearbyStations">Explore nearby charging stations</button>
        </div>

        <Map />
    </div>
</template>

<script>
import ChargingStationTable from '@/components/ChargingStationTable.vue';
import axios from 'axios';
import Map from '@/components/Map.vue'; // 导入新的地图组件


export default {
    name: 'Home',
    components: {
        ChargingStationTable,
        Map,
    },


    data() {
        return {
            stations: [],
            currentPage: 1, // 当前页码
            pageSize: 10, // 每页的项目数量
            totalStations: 0, // 充电站总数
            gotoPage: 1, // 添加这一行,用于跳转到指定页码
            searchParams: {
                city: '',
                postcode: '',
                supportsFastCharging: false,
            },
        };

    },

    computed: {
        totalPages() {
            return Math.ceil(this.totalStations / this.pageSize);
        },



    },

    created() {
        this.fetchChargingStations(); // 在组件创建时获取充电站数据
    },

    watch: {
        searchParams: {
            handler: 'searchStations',
            deep: true,
        },
    },

    methods: {
        async fetchData() {
            try {
                const response = await axios.get(this.searchParams.city || this.searchParams.postcode || this.searchParams.supportsFastCharging
                    ? 'http://localhost:8080/stations/filtered'
                    : 'http://localhost:8080/stations/homepage', {
                    params: {
                        page: this.currentPage,
                        size: this.pageSize,
                        ...this.searchParams,
                    },
                });
                this.stations = response.data.records;
                this.totalStations = response.data.total;
            } catch (error) {
                console.error('Failed to fetch data:', error);
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
            this.searchParams.city = '';
            this.searchParams.postcode = '';
            this.searchParams.supportsFastCharging = false;
            this.currentPage = 1;
            this.fetchData();
        },
    },

    watch: {
        searchParams: {
            handler: 'fetchData',
            deep: true,
        },
    },

    created() {
        this.fetchData();
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

#map-container {
    width: 60%;
    /* 修改这一行 */
    height: 400px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin: 0 auto;
    /* 添加这一行 */
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
    margin-bottom: 20px;
}

.search-container input[type='text'],
.search-container button {
    margin-right: 10px;
}
</style>