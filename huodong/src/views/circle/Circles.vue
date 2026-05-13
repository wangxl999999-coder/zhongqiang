<template>
  <div class="min-h-screen bg-gray-50 pb-6 lg:pb-0">
    <div class="bg-white sticky top-0 z-40 lg:top-16">
      <div class="max-w-3xl mx-auto p-4">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-xl font-bold text-gray-800">兴趣圈子</h1>
          <router-link to="/create-circle" class="btn-primary text-sm px-4 py-2">
            创建圈子
          </router-link>
        </div>

        <div class="relative mb-4">
          <input 
            v-model="searchQuery"
            type="text"
            class="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg"
            placeholder="搜索圈子"
          />
          <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
            :class="activeTab === tab.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
          >
            {{ tab.name }}
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        v-for="circle in filteredCircles"
        :key="circle.id"
        @click="$router.push(`/circle/${circle.id}`)"
        class="card cursor-pointer hover:shadow-md transition-shadow"
      >
        <div class="flex gap-4">
          <img :src="circle.avatar" :alt="circle.name" class="w-16 h-16 rounded-lg object-cover" />
          <div class="flex-1">
            <h3 class="font-bold text-gray-800 mb-1">{{ circle.name }}</h3>
            <p class="text-gray-500 text-sm mb-2 line-clamp-1">{{ circle.intro }}</p>
            <div class="flex gap-2 mb-2">
              <span 
                v-for="tag in circle.tags" 
                :key="tag"
                class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {{ tag }}
              </span>
            </div>
            <div class="flex items-center text-gray-400 text-xs">
              <span>{{ circle.memberCount }}成员</span>
              <span class="mx-2">·</span>
              <span>{{ circle.activityCount }}活动</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '@/stores/data'

const dataStore = useDataStore()

const tabs = [
  { id: 0, name: '推荐' },
  { id: 1, name: '热门' },
  { id: 2, name: '户外' },
  { id: 3, name: '音乐' },
  { id: 4, name: '美食' },
  { id: 5, name: '艺术' }
]

const activeTab = ref(0)
const searchQuery = ref('')

const filteredCircles = computed(() => {
  let result = [...dataStore.allCircles]
  if (searchQuery.value) {
    result = result.filter(c => c.name.includes(searchQuery.value) || c.intro.includes(searchQuery.value))
  }
  if (activeTab.value === 1) {
    result.sort((a, b) => b.memberCount - a.memberCount)
  }
  return result
})
</script>
