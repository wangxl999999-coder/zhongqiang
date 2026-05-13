import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref({
    id: null,
    phone: '',
    nickname: '',
    avatar: '',
    gender: '',
    age: null,
    signature: '',
    city: '',
    bio: '',
    socialAccounts: [],
    tags: [],
    activityCount: 0,
    followers: 0,
    following: 0
  })

  const isLoggedIn = computed(() => !!userInfo.value.id)

  function setUserInfo(info) {
    Object.assign(userInfo.value, info)
  }

  function logout() {
    userInfo.value = {
      id: null,
      phone: '',
      nickname: '',
      avatar: '',
      gender: '',
      age: null,
      signature: '',
      city: '',
      bio: '',
      socialAccounts: [],
      tags: [],
      activityCount: 0,
      followers: 0,
      following: 0
    }
    localStorage.removeItem('token')
  }

  return {
    userInfo,
    isLoggedIn,
    setUserInfo,
    logout
  }
})
