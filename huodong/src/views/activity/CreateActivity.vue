<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="bg-white sticky top-0 z-40">
      <div class="max-w-md mx-auto p-4 flex items-center justify-between">
        <div class="flex items-center">
          <button @click="$router.back()" class="p-2 -ml-2 mr-2">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            </svg>
          </button>
          <h1 class="text-lg font-bold text-gray-800">发布活动</h1>
        </div>
      </div>
    </div>

    <div class="max-w-md mx-auto p-4 space-y-4">
      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-3">活动封面</label>
        <div class="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
          <div class="text-center">
            <svg class="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            </svg>
            <p class="text-gray-500 text-sm">点击上传封面</p>
          </div>
        </div>
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-2">活动标题</label>
        <input 
          v-model="form.title"
          type="text" 
          class="input-field"
          placeholder="请输入活动标题"
        />
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-2">活动时间</label>
        <input 
          v-model="form.time"
          type="datetime-local" 
          class="input-field"
        />
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-2">活动地点</label>
        <input 
          v-model="form.location"
          type="text" 
          class="input-field"
          placeholder="请输入活动地点"
        />
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-2">人数限制</label>
        <input 
          v-model="form.people"
          type="number" 
          class="input-field"
          placeholder="请输入最大参与人数"
        />
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-2">活动费用</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
          <input 
            v-model="form.fee"
            type="number" 
            class="input-field pl-8"
            placeholder="0"
          />
        </div>
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-3">关联圈子（可选）</label>
        <select v-model="form.circleId" class="input-field">
          <option :value="null">不关联圈子</option>
          <option v-for="circle in mockCircles" :key="circle.id" :value="circle.id">{{ circle.name }}</option>
        </select>
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-3">活动标签</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in interestTags"
            :key="tag.id"
            @click="toggleTag(tag.id)"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            :class="form.tags.includes(tag.id) ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
          >
            {{ tag.name }}
          </button>
        </div>
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-2">活动详情</label>
        <textarea 
          v-model="form.description"
          class="input-field h-32 resize-none"
          placeholder="请输入活动详细介绍"
        ></textarea>
      </div>

      <button @click="handlePublish" class="btn-primary w-full py-3">
        发布活动
      </button>
    </div>

    <TabBar />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TabBar from '@/components/TabBar.vue'
import { interestTags, mockCircles } from '@/utils/mockData'

const router = useRouter()

const form = ref({
  title: '',
  time: '',
  location: '',
  people: 50,
  fee: 0,
  circleId: null,
  tags: [],
  description: ''
})

const toggleTag = (tagId) => {
  const index = form.value.tags.indexOf(tagId)
  if (index > -1) {
    form.value.tags.splice(index, 1)
  } else {
    form.value.tags.push(tagId)
  }
}

const handlePublish = () => {
  if (!form.value.title) {
    alert('请输入活动标题')
    return
  }
  if (!form.value.time) {
    alert('请选择活动时间')
    return
  }
  if (!form.value.location) {
    alert('请输入活动地点')
    return
  }
  if (!form.value.description) {
    alert('请输入活动详情')
    return
  }
  alert('活动发布成功！等待审核通过后即可展示')
  router.push('/home')
}
</script>
