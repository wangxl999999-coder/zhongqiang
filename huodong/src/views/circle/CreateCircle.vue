<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white sticky top-0 z-40">
      <div class="max-w-md mx-auto p-4 flex items-center">
        <button @click="$router.back()" class="p-2 -ml-2 mr-2">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
        </button>
        <h1 class="text-lg font-bold text-gray-800">创建圈子</h1>
      </div>
    </div>

    <div class="max-w-md mx-auto p-4 space-y-6">
      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-3">圈子头像</label>
        <div class="flex items-center gap-4">
          <ImageUpload v-model="form.avatar" placeholder="点击上传" size="small" />
          <p class="text-gray-500 text-sm">点击上传头像（建议尺寸 200x200）</p>
        </div>
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-2">圈子名称</label>
        <input 
          v-model="form.name"
          type="text" 
          class="input-field"
          placeholder="请输入圈子名称"
          maxlength="20"
        />
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-2">圈子简介</label>
        <textarea 
          v-model="form.intro"
          class="input-field h-24 resize-none"
          placeholder="简单介绍一下你的圈子"
          maxlength="100"
        ></textarea>
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-3">兴趣标签</label>
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

      <button @click="handleCreate" class="btn-primary w-full py-3">
        创建圈子
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ImageUpload from '@/components/ImageUpload.vue'
import { interestTags } from '@/utils/mockData'
import { useDataStore } from '@/stores/data'

const router = useRouter()
const dataStore = useDataStore()

const form = ref({
  name: '',
  intro: '',
  tags: [],
  avatar: ''
})

const toggleTag = (tagId) => {
  const index = form.value.tags.indexOf(tagId)
  if (index > -1) {
    form.value.tags.splice(index, 1)
  } else {
    form.value.tags.push(tagId)
  }
}

const handleCreate = () => {
  if (!form.value.name) {
    alert('请输入圈子名称')
    return
  }
  if (!form.value.intro) {
    alert('请输入圈子简介')
    return
  }
  if (form.value.tags.length === 0) {
    alert('请至少选择一个标签')
    return
  }

  const tagNames = form.value.tags.map(id => {
    const tag = interestTags.find(t => t.id === id)
    return tag ? tag.name : ''
  }).filter(Boolean)

  dataStore.addCircle({
    ...form.value,
    tags: tagNames
  })

  alert('圈子创建成功！')
  router.back()
}
</script>
