<template>
  <div class="image-upload">
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />
    <div
      v-if="!imageUrl"
      @click="triggerUpload"
      class="cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center rounded-xl"
      :class="containerClass"
    >
      <div class="text-center">
        <svg class="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
        </svg>
        <p class="text-gray-500 text-sm">{{ placeholder }}</p>
      </div>
    </div>
    <div v-else @click="triggerUpload" class="cursor-pointer relative rounded-xl overflow-hidden" :class="containerClass">
      <img :src="imageUrl" alt="preview" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '点击上传图片'
  },
  isCircle: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'normal'
  }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const imageUrl = ref(props.modelValue)

const containerClass = computed(() => {
  const classes = []
  if (props.isCircle) {
    classes.push('rounded-full')
  } else {
    classes.push('rounded-xl')
  }
  if (props.size === 'small') {
    classes.push('w-20 h-20')
  } else if (props.size === 'large') {
    classes.push('w-full h-40')
  } else {
    classes.push('w-24 h-24')
  }
  return classes
})

const triggerUpload = () => {
  fileInput.value.click()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imageUrl.value = e.target.result
      emit('update:modelValue', e.target.result)
    }
    reader.readAsDataURL(file)
  }
}
</script>

<style scoped>
.hidden {
  display: none;
}
</style>
