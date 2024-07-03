import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Map from '../views/Map.vue';
import AvailabilityPage from '../views/AvailabilityPage.vue';

const routes = [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      name: 'Home',
      component: Home,
    },
    {
        path: '/map',
        name: 'Map',
        component: Map,
      },

      {
        path: '/availability/:stationName',
        name: 'Availability',
        component: AvailabilityPage,
      },
  ];
  

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;