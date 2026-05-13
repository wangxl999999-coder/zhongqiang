<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <div class="relative">
      <img :src="activity.cover" :alt="activity.title" class="w-full h-56 object-cover" />
      <button @click="$router.back()" class="absolute top-4 left-4 p-2 bg-black/30 rounded-full text-white">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
        </svg>
      </button>
      <button class="absolute top-4 right-4 p-2 bg-black/30 rounded-full text-white">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
        </svg>
      </button>
    </div>

    <div class="card -mt-4 mx-4 relative">
      <h1 class="text-xl font-bold text-gray-800 mb-3">{{ activity.title }}</h1>
      
      <div class="flex items-center text-gray-600 text-sm mb-2">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
        </svg>
        <span>{{ activity.time }} - {{ activity.endTime }}</span>
      </div>
      
      <div class="flex items-center text-gray-600 text-sm mb-2">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
        </svg>
        <span>{{ activity.location }}</span>
      </div>

      <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div>
            <p class="font-medium text-gray-800">{{ activity.organizer.name }}</p>
            <p class="text-xs text-gray-500">{{ activity.organizer.bio }}</p>
          </div>
        </div>
        <button class="px-3 py-1 border border-primary-500 text-primary-500 rounded-full text-sm">关注</button>
      </div>
    </div>

    <div v-if="activity.circle" class="card mx-4 my-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img :src="mockCircles[0].avatar" class="w-10 h-10 rounded-lg" />
        <div>
          <p class="font-medium text-gray-800">{{ activity.circle.name }}</p>
          <p class="text-xs text-gray-500">来自该圈子</p>
        </div>
      </div>
      <button @click="$router.push(`/circle/${activity.circle.id}`)" class="text-primary-500 text-sm">查看</button>
    </div>

    <div class="max-w-md mx-auto">
      <div class="flex border-b border-gray-100 bg-white sticky top-0 z-30">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex-1 py-3 text-center font-medium transition-all"
          :class="activeTab === tab.id ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500'"
        >
          {{ tab.name }}
        </button>
      </div>

      <div v-if="activeTab === 'intro'" class="p-4 space-y-4">
        <div class="card">
          <h3 class="font-bold text-gray-800 mb-3">活动介绍</h3>
          <p class="text-gray-600 text-sm leading-relaxed">{{ activity.description }}</p>
        </div>

        <div class="card">
          <h3 class="font-bold text-gray-800 mb-3">精彩图片</h3>
          <div class="grid grid-cols-3 gap-2">
            <img v-for="(img, index) in activity.images" :key="index" :src="img" class="w-full h-24 object-cover rounded-lg" />
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'schedule'" class="p-4 space-y-4">
        <div class="card">
          <h3 class="font-bold text-gray-800 mb-4">活动流程</h3>
          <div class="space-y-4">
            <div v-for="(item, index) in activity.schedule" :key="index" class="flex gap-4">
              <div class="flex flex-col items-center">
                <div class="w-3 h-3 bg-primary-500 rounded-full"></div>
                <div v-if="index < activity.schedule.length - 1" class="w-0.5 h-full bg-gray-200 mt-1"></div>
              </div>
              <div class="pb-4">
                <p class="text-primary-500 font-medium text-sm">{{ item.time }}</p>
                <p class="text-gray-600 text-sm mt-1">{{ item.content }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="font-bold text-gray-800 mb-3">特邀嘉宾</h3>
          <div v-for="guest in activity.guests" :key="guest.name" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div>
              <p class="font-medium text-gray-800">{{ guest.name }}</p>
              <p class="text-sm text-primary-500">{{ guest.title }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ guest.intro }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'notice'" class="p-4 space-y-4">
        <div class="card">
          <h3 class="font-bold text-gray-800 mb-3">注意事项</h3>
          <ul class="space-y-2">
            <li v-for="(notice, index) in activity.notices" :key="index" class="flex items-start gap-2 text-gray-600 text-sm">
              <span class="text-primary-500">•</span>
              <span>{{ notice }}</span>
            </li>
          </ul>
        </div>

        <div class="card">
          <h3 class="font-bold text-gray-800 mb-3">报名条件</h3>
          <ul class="space-y-2">
            <li v-for="(cond, index) in activity.conditions" :key="index" class="flex items-start gap-2 text-gray-600 text-sm">
              <span class="text-primary-500">•</span>
              <span>{{ cond }}</span>
            </li>
          </ul>
        </div>

        <div class="card">
          <h3 class="font-bold text-gray-800 mb-3">退款规则</h3>
          <p class="text-gray-600 text-sm">{{ activity.refundPolicy }}</p>
        </div>
      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
      <div class="max-w-md mx-auto flex items-center justify-between">
        <div>
          <span class="text-2xl font-bold text-primary-500">¥{{ activity.fee }}</span>
          <span class="text-gray-500 text-sm ml-2">{{ activity.joined }}/{{ activity.people }}人</span>
        </div>
        <button @click="handleJoin" class="btn-primary px-8 py-3">
          立即报名
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { mockActivityDetail, mockCircles } from '@/utils/mockData'

const activity = ref(mockActivityDetail)

const tabs = [
  { id: 'intro', name: '介绍' },
  { id: 'schedule', name: '流程' },
  { id: 'notice', name: '须知' }
]

const activeTab = ref('intro')

const handleJoin = () => {
  alert('报名成功！活动详情已发送到您的消息')
}
</script>
