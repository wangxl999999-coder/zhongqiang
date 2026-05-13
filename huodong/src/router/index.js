import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue')
  },
  {
    path: '/select-tags',
    name: 'SelectTags',
    component: () => import('@/views/auth/SelectTags.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/Home.vue')
  },
  {
    path: '/circles',
    name: 'Circles',
    component: () => import('@/views/circle/Circles.vue')
  },
  {
    path: '/circle/:id',
    name: 'CircleDetail',
    component: () => import('@/views/circle/CircleDetail.vue')
  },
  {
    path: '/create-circle',
    name: 'CreateCircle',
    component: () => import('@/views/circle/CreateCircle.vue')
  },
  {
    path: '/activity/:id',
    name: 'ActivityDetail',
    component: () => import('@/views/activity/ActivityDetail.vue')
  },
  {
    path: '/create-activity',
    name: 'CreateActivity',
    component: () => import('@/views/activity/CreateActivity.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/user/Profile.vue')
  },
  {
    path: '/edit-profile',
    name: 'EditProfile',
    component: () => import('@/views/user/EditProfile.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  if (to.path !== '/login' && to.path !== '/register' && !isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    next('/home')
  } else {
    next()
  }
})

export default router
