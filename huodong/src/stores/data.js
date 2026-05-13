import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockActivities, mockCircles } from '@/utils/mockData'

export const useDataStore = defineStore('data', () => {
  const activities = ref([...mockActivities])
  const circles = ref([...mockCircles])
  const userActivities = ref([])
  const userCircles = ref([])

  const allActivities = computed(() => {
    return [...activities.value, ...userActivities.value]
  })

  const allCircles = computed(() => {
    return [...circles.value, ...userCircles.value]
  })

  function addActivity(activity) {
    const newActivity = {
      id: Date.now(),
      cover: activity.cover || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=event%20activity%20gathering&image_size=landscape_16_9',
      title: activity.title,
      time: activity.time,
      location: activity.location,
      people: activity.people || 50,
      joined: 0,
      fee: activity.fee || 0,
      tags: activity.tags || [],
      circle: activity.circleId ? { id: activity.circleId, name: circles.value.find(c => c.id === activity.circleId)?.name } : null,
      organizer: { id: 1, name: '我', avatar: '', bio: '活动组织者' },
      description: activity.description,
      images: [],
      schedule: [],
      guests: [],
      notices: [],
      conditions: [],
      refundPolicy: '活动开始前48小时可全额退款'
    }
    userActivities.value.unshift(newActivity)
    return newActivity
  }

  function addCircle(circle) {
    const newCircle = {
      id: Date.now(),
      name: circle.name,
      avatar: circle.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=community%20group%20logo&image_size=square',
      intro: circle.intro,
      tags: circle.tags || [],
      memberCount: 1,
      activityCount: 0,
      notice: '欢迎加入圈子！'
    }
    userCircles.value.unshift(newCircle)
    return newCircle
  }

  function getUserActivities() {
    return userActivities.value
  }

  return {
    activities,
    circles,
    userActivities,
    userCircles,
    allActivities,
    allCircles,
    addActivity,
    addCircle,
    getUserActivities
  }
})
