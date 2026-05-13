<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="bg-white">
      <div class="relative">
        <div class="h-40 bg-gradient-to-r from-primary-400 to-primary-600"></div>
        <button @click="$router.back()" class="absolute top-4 left-4 p-2 bg-black/30 rounded-full text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
        </button>
        <div class="absolute -bottom-10 left-4">
          <img :src="circle.avatar" :alt="circle.name" class="w-20 h-20 rounded-xl border-4 border-white object-cover" />
        </div>
      </div>

      <div class="pt-12 px-4 pb-4">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h1 class="text-xl font-bold text-gray-800">{{ circle.name }}</h1>
            <p class="text-gray-500 text-sm mt-1">{{ circle.memberCount }}成员 · {{ circle.activityCount }}活动</p>
          </div>
          <button 
            @click="toggleJoin"
            class="px-4 py-2 rounded-lg font-medium transition-all"
            :class="isJoined ? 'bg-gray-100 text-gray-600' : 'btn-primary'"
          >
            {{ isJoined ? '已加入' : '+ 加入' }}
          </button>
        </div>

        <p class="text-gray-600 text-sm mb-3">{{ circle.intro }}</p>
        <div class="flex gap-2">
          <span 
            v-for="tag in circle.tags" 
            :key="tag"
            class="px-3 py-1 bg-primary-50 text-primary-600 text-sm rounded-full"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <div class="card mx-4 my-4">
      <h3 class="font-bold text-gray-800 mb-2">📢 圈子公告</h3>
      <p class="text-gray-600 text-sm">{{ circle.notice }}</p>
    </div>

    <div class="max-w-md mx-auto">
      <div class="flex border-b border-gray-100 bg-white">
        <button
          v-for="tab in detailTabs"
          :key="tab.id"
          @click="activeDetailTab = tab.id"
          class="flex-1 py-3 text-center font-medium transition-all"
          :class="activeDetailTab === tab.id ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500'"
        >
          {{ tab.name }}
        </button>
      </div>

      <div v-if="activeDetailTab === 'activities'" class="p-4 space-y-4">
        <div 
          v-for="activity in circleActivities"
          :key="activity.id"
          @click="$router.push(`/activity/${activity.id}`)"
          class="card cursor-pointer hover:shadow-md transition-shadow"
        >
          <img :src="activity.cover" :alt="activity.title" class="w-full h-32 object-cover rounded-lg mb-3" />
          <h4 class="font-bold text-gray-800 mb-2">{{ activity.title }}</h4>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">{{ activity.time }}</span>
            <span class="text-primary-500 font-bold">¥{{ activity.fee }}</span>
          </div>
        </div>
      </div>

      <div v-if="activeDetailTab === 'members'" class="p-4">
        <div class="grid grid-cols-4 gap-4">
          <div v-for="i in 12" :key="i" class="text-center">
            <div class="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-1"></div>
            <p class="text-xs text-gray-600 truncate">用户{{ i }}</p>
          </div>
        </div>
      </div>
    </div>

    <TabBar />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TabBar from '@/components/TabBar.vue'
import { mockCircles, mockActivities } from '@/utils/mockData'

const circle = ref(mockCircles[0])
const isJoined = ref(false)

const detailTabs = [
  { id: 'activities', name: '活动' },
  { id: 'members', name: '成员' }
]

const activeDetailTab = ref('activities')

const circleActivities = ref(mockActivities.slice(0, 3))

const toggleJoin = () => {
  isJoined.value = !isJoined.value
}
</script>
