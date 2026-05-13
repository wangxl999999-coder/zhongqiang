<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="bg-white sticky top-0 z-40">
      <div class="max-w-md mx-auto p-4">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-xl font-bold text-gray-800">发现活动</h1>
          <div class="flex gap-3">
            <button class="p-2 hover:bg-gray-100 rounded-full">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="activeCategory = cat.id"
            class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
            :class="activeCategory === cat.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-md mx-auto p-4 space-y-4">
      <div 
        v-for="activity in filteredActivities"
        :key="activity.id"
        @click="$router.push(`/activity/${activity.id}`)"
        class="card cursor-pointer hover:shadow-md transition-shadow"
      >
        <img :src="activity.cover" :alt="activity.title" class="w-full h-40 object-cover rounded-lg mb-3" />
        <h3 class="font-bold text-gray-800 mb-2">{{ activity.title }}</h3>
        <div class="flex items-center text-gray-500 text-sm mb-2">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
          <span>{{ activity.time }}</span>
        </div>
        <div class="flex items-center text-gray-500 text-sm mb-3">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
          <span>{{ activity.location }}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex gap-2">
            <span 
              v-for="tag in activity.tags.slice(0, 2)" 
              :key="tag"
              class="px-2 py-1 bg-primary-50 text-primary-600 text-xs rounded-full"
            >
              {{ tag }}
            </span>
          </div>
          <div class="flex items-center">
            <span class="text-primary-500 font-bold">¥{{ activity.fee }}</span>
            <span class="text-gray-400 text-sm ml-1">{{ activity.joined }}/{{ activity.people }}人</span>
          </div>
        </div>
      </div>
    </div>

    <TabBar />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TabBar from '@/components/TabBar.vue'
import { mockActivities } from '@/utils/mockData'

const categories = [
  { id: 0, name: '全部' },
  { id: 1, name: '户外探险' },
  { id: 2, name: '音乐演出' },
  { id: 3, name: '摄影摄像' },
  { id: 4, name: '美食烹饪' },
  { id: 5, name: '读书分享' },
  { id: 6, name: '桌游聚会' },
  { id: 7, name: '艺术展览' }
]

const activeCategory = ref(0)

const filteredActivities = computed(() => {
  if (activeCategory.value === 0) return mockActivities
  const catName = categories.find(c => c.id === activeCategory.value)?.name
  return mockActivities.filter(a => a.tags.includes(catName))
})
</script>
