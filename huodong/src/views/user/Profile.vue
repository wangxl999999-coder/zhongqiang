<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="bg-white">
      <div class="bg-gradient-to-r from-primary-400 to-primary-600 pt-8 pb-16 px-4">
        <div class="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-white">个人中心</h1>
            <p class="text-white/80 text-sm mt-1">管理你的账号和活动</p>
          </div>
          <router-link to="/edit-profile" class="p-2 bg-white/20 rounded-full">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            </svg>
          </router-link>
        </div>
      </div>

      <div class="max-w-md mx-auto px-4 -mt-10">
        <div class="card">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div class="flex-1">
              <h2 class="text-lg font-bold text-gray-800">{{ userNickname }}</h2>
              <p class="text-gray-500 text-sm">{{ userBio || '这个人很懒，什么都没写' }}</p>
            </div>
          </div>

          <div class="flex justify-around text-center py-4 border-t border-gray-100">
            <div>
              <p class="text-xl font-bold text-gray-800">3</p>
              <p class="text-sm text-gray-500">发起活动</p>
            </div>
            <div>
              <p class="text-xl font-bold text-gray-800">128</p>
              <p class="text-sm text-gray-500">粉丝</p>
            </div>
            <div>
              <p class="text-xl font-bold text-gray-800">56</p>
              <p class="text-sm text-gray-500">关注</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-md mx-auto mt-4">
      <div class="flex border-b border-gray-100 bg-white">
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

      <div v-if="activeTab === 'activities'" class="p-4 space-y-4">
        <div 
          v-for="activity in myActivities"
          :key="activity.id"
          @click="$router.push(`/activity/${activity.id}`)"
          class="card cursor-pointer hover:shadow-md transition-shadow"
        >
          <div class="flex gap-3">
            <img :src="activity.cover" :alt="activity.title" class="w-24 h-24 object-cover rounded-lg" />
            <div class="flex-1">
              <h4 class="font-bold text-gray-800 mb-1 line-clamp-2">{{ activity.title }}</h4>
              <p class="text-gray-500 text-sm mb-1">{{ activity.time }}</p>
              <p class="text-primary-500 font-bold">¥{{ activity.fee }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'moments'" class="p-4">
        <div class="text-center py-12">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
          <p class="text-gray-500">暂无动态</p>
        </div>
      </div>

      <div v-if="activeTab === 'favorites'" class="p-4 space-y-4">
        <div 
          v-for="activity in favoriteActivities"
          :key="activity.id"
          @click="$router.push(`/activity/${activity.id}`)"
          class="card cursor-pointer hover:shadow-md transition-shadow"
        >
          <div class="flex gap-3">
            <img :src="activity.cover" :alt="activity.title" class="w-24 h-24 object-cover rounded-lg" />
            <div class="flex-1">
              <h4 class="font-bold text-gray-800 mb-1 line-clamp-2">{{ activity.title }}</h4>
              <p class="text-gray-500 text-sm mb-1">{{ activity.time }}</p>
              <p class="text-primary-500 font-bold">¥{{ activity.fee }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-md mx-auto px-4 mt-4">
      <button @click="handleLogout" class="w-full py-3 bg-white text-red-500 font-medium rounded-xl">
        退出登录
      </button>
    </div>

    <TabBar />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TabBar from '@/components/TabBar.vue'
import { mockActivities } from '@/utils/mockData'

const router = useRouter()

const userNickname = ref(localStorage.getItem('userNickname') || '用户')
const userBio = ref('热爱生活，喜欢参加各种活动')

const tabs = [
  { id: 'activities', name: '活动' },
  { id: 'moments', name: '动态' },
  { id: 'favorites', name: '收藏' }
]

const activeTab = ref('activities')

const myActivities = ref(mockActivities.slice(0, 2))
const favoriteActivities = ref(mockActivities.slice(2, 4))

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('token')
    localStorage.removeItem('userPhone')
    localStorage.removeItem('userNickname')
    localStorage.removeItem('userTags')
    router.push('/login')
  }
}
</script>
