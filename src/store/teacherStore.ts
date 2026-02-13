import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTeacherStore = defineStore('teacher', () => {
  // 教师基本信息
  const teacherInfo = ref({
    teacherId: '',
    name: '',
    avatar: '',
    schoolId: '',
    schoolName: '',
    collegeName: '',
    title: '',
    expertise: '',
    guidanceCount: 0,
    ratingScore: 0
  })

  // 待指导项目数量
  const pendingCount = ref(0)

  // 加载教师信息
  const loadTeacherInfo = async () => {
    try {
      // TODO: 调用API获取教师信息
      // const res = await getTeacherInfo()
      // teacherInfo.value = res.data
      // pendingCount.value = res.data.pendingCount
    } catch (error) {
      console.error('加载教师信息失败', error)
    }
  }

  // 更新待办数量
  const updatePendingCount = (count: number) => {
    pendingCount.value = count
  }

  return {
    teacherInfo,
    pendingCount,
    loadTeacherInfo,
    updatePendingCount
  }
})
