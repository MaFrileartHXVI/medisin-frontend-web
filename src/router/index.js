import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import LoginPage from '../pages/LoginPage.vue';
import DashboardPage from '../pages/DashboardPage.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { guestOnly: true },
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardPage,
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('sintasi_token');

  if (to.meta.requiresAuth && !token) {
    next({ name: 'login' });
  } else if (to.meta.guestOnly && token) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;
