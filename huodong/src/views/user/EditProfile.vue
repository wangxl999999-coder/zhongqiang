<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white sticky top-0 z-40">
      <div class="max-w-md mx-auto p-4 flex items-center justify-between">
        <div class="flex items-center">
          <button @click="$router.back()" class="p-2 -ml-2 mr-2">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            </svg>
          </button>
          <h1 class="text-lg font-bold text-gray-800">编辑资料</h1>
        </div>
        <button @click="handleSave" class="text-primary-500 font-medium">保存</button>
      </div>
    </div>

    <div class="max-w-md mx-auto p-4 space-y-4">
      <div class="card text-center">
        <label class="block text-sm font-medium text-gray-700 mb-3">头像</label>
        <ImageUpload v-model="form.avatar" placeholder="点击上传" is-circle size="normal" />
        <p class="text-gray-500 text-sm mt-2">点击更换头像</p>
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-2">昵称</label>
        <input 
          v-model="form.nickname"
          type="text" 
          class="input-field"
          placeholder="请输入昵称"
        />
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-2">性别</label>
        <div class="flex gap-4">
          <button
            v-for="g in genders"
            :key="g.value"
            @click="form.gender = g.value"
            class="flex-1 py-2 rounded-lg border-2 font-medium transition-all"
            :class="form.gender === g.value ? 'border-primary-500 text-primary-500 bg-primary-50' : 'border-gray-200 text-gray-600'"
          >
            {{ g.label }}
          </button>
        </div>
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-2">年龄</label>
        <input 
          v-model="form.age"
          type="number" 
          class="input-field"
          placeholder="请输入年龄"
        />
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-2">个性签名</label>
        <input 
          v-model="form.signature"
          type="text" 
          class="input-field"
          placeholder="写下你的个性签名"
          maxlength="50"
        />
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-2">所在城市</label>
        <input 
          v-model="form.city"
          type="text" 
          class="input-field"
          placeholder="请输入城市"
        />
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-2">个人简介</label>
        <textarea 
          v-model="form.bio"
          class="input-field h-24 resize-none"
          placeholder="简单介绍一下自己"
          maxlength="200"
        ></textarea>
      </div>

      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-3">社交账号绑定</label>
        <div class="space-y-3">
          <div class="flex items-center justify-between py-2 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
                </svg>
              </div>
              <span class="text-gray-700">微信</span>
            </div>
            <button class="text-primary-500 text-sm">去绑定</button>
          </div>
          <div class="flex items-center justify-between py-2">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              <span class="text-gray-700">QQ</span>
            </div>
            <button class="text-primary-500 text-sm">去绑定</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ImageUpload from '@/components/ImageUpload.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const genders = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '保密', value: 'secret' }
]

const form = ref({
  nickname: userStore.userInfo.nickname || localStorage.getItem('userNickname') || '',
  gender: userStore.userInfo.gender || 'secret',
  age: userStore.userInfo.age || '',
  signature: userStore.userInfo.signature || '',
  city: userStore.userInfo.city || '',
  bio: userStore.userInfo.bio || '',
  avatar: userStore.userInfo.avatar || ''
})

const handleSave = () => {
  if (!form.value.nickname) {
    alert('请输入昵称')
    return
  }
  localStorage.setItem('userNickname', form.value.nickname)
  userStore.setUserInfo(form.value)
  alert('资料保存成功！')
  router.back()
}
</script>
