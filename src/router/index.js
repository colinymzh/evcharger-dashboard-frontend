import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Navigation from '../views/Navigation.vue';
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
        path: '/navigation',
        name: 'Navigation',
        component: Navigation,
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