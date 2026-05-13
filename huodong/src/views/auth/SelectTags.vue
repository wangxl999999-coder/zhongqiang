<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-md mx-auto p-6">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-800">选择你的兴趣</h1>
        <p class="text-gray-500 mt-2">至少选择3个，为你推荐更精准的内容</p>
      </div>

      <div class="flex flex-wrap gap-3 mb-8">
        <button
          v-for="tag in interestTags"
          :key="tag.id"
          @click="toggleTag(tag)"
          class="px-4 py-2 rounded-full font-medium transition-all duration-200"
          :class="selectedTags.includes(tag.id) ? 'bg-primary-500 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300'"
        >
          {{ tag.name }}
        </button>
      </div>

      <div class="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <div class="max-w-md mx-auto">
          <div class="flex justify-between items-center mb-3">
            <span class="text-gray-500">已选 {{ selectedTags.length }} 个标签</span>
            <button v-if="selectedTags.length > 0" @click="selectedTags = []" class="text-primary-600 text-sm">清空</button>
          </div>
          <button 
            @click="handleNext"
            :disabled="selectedTags.length < 3"
            class="btn-primary w-full py-3 disabled:opacity-50"
          >
            下一步
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { interestTags } from '@/utils/mockData'

const router = useRouter()
const selectedTags = ref([])

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag.id)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag.id)
  }
}

const handleNext = () => {
  localStorage.setItem('userTags', JSON.stringify(selectedTags.value))
  router.push('/home')
}
</script>
