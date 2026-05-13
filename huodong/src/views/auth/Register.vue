<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary-500 rounded-xl mx-auto flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">创建账号</h1>
        <p class="text-gray-500 mt-2">加入趣活动，发现精彩</p>
      </div>

      <form @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">手机号</label>
            <input 
              v-model="phone" 
              type="tel" 
              maxlength="11"
              class="input-field"
              placeholder="请输入手机号"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">验证码</label>
            <div class="flex gap-3">
              <input 
                v-model="code" 
                type="text" 
                maxlength="6"
                class="input-field flex-1"
                placeholder="请输入验证码"
              />
              <button 
                type="button"
                @click="sendCode"
                :disabled="countdown > 0"
                class="px-4 py-2 bg-gray-100 text-primary-600 rounded-lg font-medium whitespace-nowrap disabled:opacity-50"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">设置昵称</label>
            <input 
              v-model="nickname" 
              type="text" 
              maxlength="20"
              class="input-field"
              placeholder="请输入昵称"
            />
          </div>
        </div>

        <button type="submit" class="btn-primary w-full mt-6 py-3">
          注册
        </button>
      </form>

      <div class="mt-6 text-center">
        <span class="text-gray-500">已有账号？</span>
        <router-link to="/login" class="text-primary-600 font-medium ml-1">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const phone = ref('')
const code = ref('')
const nickname = ref('')
const countdown = ref(0)

const sendCode = () => {
  if (!phone.value || phone.value.length !== 11) {
    alert('请输入正确的手机号')
    return
  }
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleRegister = () => {
  if (!phone.value || !code.value || !nickname.value) {
    alert('请填写完整信息')
    return
  }
  localStorage.setItem('token', 'mock-token-' + Date.now())
  localStorage.setItem('userPhone', phone.value)
  localStorage.setItem('userNickname', nickname.value)
  router.push('/select-tags')
}
</script>
