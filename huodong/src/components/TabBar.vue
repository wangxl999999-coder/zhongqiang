<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
    <div class="flex justify-around items-center py-2 max-w-md mx-auto">
      <router-link 
        v-for="item in tabs" 
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center py-1 px-4"
        :class="{ 'text-primary-500': isActive(item.path) }"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path :d="item.icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
        </svg>
        <span class="text-xs mt-1">{{ item.name }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const tabs = [
  { name: '首页', path: '/home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: '圈子', path: '/circles', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { name: '发布', path: '/create-activity', icon: 'M12 4v16m8-8H4' },
  { name: '我的', path: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
]

const isActive = (path) => {
  return route.path.startsWith(path)
}
</script>
