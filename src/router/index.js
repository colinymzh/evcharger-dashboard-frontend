import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Navigation from '../views/Navigation.vue';


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
  ];
  

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;