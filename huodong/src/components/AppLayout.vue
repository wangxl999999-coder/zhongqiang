<template>
  <div class="min-h-screen bg-gray-100">
    <div class="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            </svg>
          </div>
          <span class="text-xl font-bold text-gray-800">趣活动</span>
        </div>
        <div class="flex items-center gap-6">
          <router-link to="/home" class="flex items-center gap-2 text-gray-600 hover:text-primary-500" :class="{ 'text-primary-500': $route.path === '/home' }">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            </svg>
            <span>首页</span>
          </router-link>
          <router-link to="/circles" class="flex items-center gap-2 text-gray-600 hover:text-primary-500" :class="{ 'text-primary-500': $route.path === '/circles' }">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            </svg>
            <span>圈子</span>
          </router-link>
          <router-link to="/create-activity" class="flex items-center gap-2 text-gray-600 hover:text-primary-500" :class="{ 'text-primary-500': $route.path === '/create-activity' }">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            </svg>
            <span>发布</span>
          </router-link>
          <router-link to="/profile" class="flex items-center gap-2 text-gray-600 hover:text-primary-500" :class="{ 'text-primary-500': $route.path === '/profile' }">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            </svg>
            <span>我的</span>
          </router-link>
        </div>
      </div>
    </div>

    <div class="lg:pt-16">
      <div class="max-w-3xl mx-auto min-h-screen bg-white shadow-sm">
        <slot />
      </div>
    </div>

    <div class="lg:hidden">
      <TabBar />
    </div>
  </div>
</template>

<script setup>
import TabBar from './TabBar.vue'
</script>
