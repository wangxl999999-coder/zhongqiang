import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue')
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('../views/Projects.vue'),
        meta: { roles: ['admin'] }
      },
      {
        path: 'projects/:id',
        name: 'ProjectDetail',
        component: () => import('../views/ProjectDetail.vue'),
        meta: { roles: ['admin'] }
      },
      {
        path: 'my-tasks',
        name: 'MyTasks',
        component: () => import('../views/MyTasks.vue'),
        meta: { roles: ['annotator'] }
      },
      {
        path: 'task-pool',
        name: 'TaskPool',
        component: () => import('../views/TaskPool.vue'),
        meta: { roles: ['annotator'] }
      },
      {
        path: 'annotate/:taskId',
        name: 'Annotate',
        component: () => import('../views/Annotate.vue'),
        meta: { roles: ['annotator'] }
      },
      {
        path: 'review',
        name: 'Review',
        component: () => import('../views/Review.vue'),
        meta: { roles: ['reviewer', 'admin'] }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/Users.vue'),
        meta: { roles: ['admin'] }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.guest && authStore.isLoggedIn) {
    return next('/');
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next('/login');
  }

  if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) {
    return next('/');
  }

  next();
});

export default router;
