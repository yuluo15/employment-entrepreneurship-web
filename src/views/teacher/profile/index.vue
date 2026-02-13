<template>
  <div class="teacher-profile min-h-screen bg-[#f7f8fa] pb-4">
    <!-- 顶部信息卡片 -->
    <div class="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 pt-8 pb-12">
      <div class="flex items-center">
        <van-image
          round
          width="70px"
          height="70px"
          :src="teacherInfo.avatar"
          class="mr-4 border-3 border-white shadow-lg"
        >
          <template #default>
            <div class="w-full h-full bg-white/20 flex items-center justify-center">
              <van-icon name="user-o" size="35" color="white" />
            </div>
          </template>
        </van-image>
        <div class="flex-1 text-white">
          <div class="text-xl font-bold mb-1">{{ teacherInfo.name }}</div>
          <div class="text-sm opacity-90">{{ teacherInfo.title }} · {{ teacherInfo.collegeName }}</div>
          <div class="text-xs opacity-75 mt-1">{{ teacherInfo.schoolName }}</div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="px-4 -mt-8 mb-4">
      <div class="bg-white rounded-lg shadow-lg p-4">
        <div class="grid grid-cols-3 divide-x divide-gray-100">
          <div class="text-center">
            <div class="text-xl font-bold text-purple-600">{{ teacherInfo.guidanceCount }}</div>
            <div class="text-xs text-gray-500 mt-1">指导次数</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-blue-600">{{ teacherInfo.projectCount }}</div>
            <div class="text-xs text-gray-500 mt-1">指导项目</div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center">
              <div class="text-xl font-bold text-orange-500">{{ teacherInfo.ratingScore }}</div>
              <van-icon name="star" color="#f59e0b" size="16" class="ml-1" />
            </div>
            <div class="text-xs text-gray-500 mt-1">评分</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 个人信息 -->
    <van-cell-group :border="false" class="mb-3" title="个人信息">
      <van-cell title="工号" :value="teacherInfo.employeeNo" />
      <van-cell title="学院" :value="teacherInfo.collegeName" />
      <van-cell title="职称" :value="teacherInfo.title" />
      <van-cell title="专业领域" :value="teacherInfo.expertise" />
      <van-cell title="手机号" :value="teacherInfo.phone" />
      <van-cell title="邮箱" :value="teacherInfo.email" />
    </van-cell-group>

    <!-- 功能菜单 -->
    <van-cell-group :border="false" class="mb-3" title="功能设置">
      <van-cell
        title="个人信息"
        is-link
        @click="$router.push('/teacher/profile/info')"
      >
        <template #icon>
          <van-icon name="user-o" class="mr-3" color="#8b5cf6" />
        </template>
      </van-cell>
      <van-cell
        title="修改密码"
        is-link
        @click="$router.push('/teacher/settings/password')"
      >
        <template #icon>
          <van-icon name="lock" class="mr-3" color="#3b82f6" />
        </template>
      </van-cell>
      <van-cell
        title="通知设置"
        is-link
        @click="showToast('功能开发中')"
      >
        <template #icon>
          <van-icon name="bell" class="mr-3" color="#f59e0b" />
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 其他 -->
    <van-cell-group :border="false" class="mb-3">
      <van-cell
        title="关于我们"
        is-link
        @click="showToast('功能开发中')"
      >
        <template #icon>
          <van-icon name="info-o" class="mr-3" color="#6b7280" />
        </template>
      </van-cell>
      <van-cell
        title="帮助与反馈"
        is-link
        @click="showToast('功能开发中')"
      >
        <template #icon>
          <van-icon name="question-o" class="mr-3" color="#6b7280" />
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 退出登录 -->
    <div class="px-4 mt-6">
      <van-button
        block
        round
        type="danger"
        @click="handleLogout"
      >
        退出登录
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useUserStore } from '@/store/userStore'
import { getTeacherInfo } from '@/api/teacher'

defineOptions({ name: 'TeacherProfile' })

const router = useRouter()
const userStore = useUserStore()

// 教师信息
const teacherInfo = ref({
  name: '张教授',
  avatar: '',
  employeeNo: 'T20230001',
  schoolName: '四川大学',
  collegeName: '计算机学院',
  title: '教授',
  expertise: '人工智能、大数据',
  phone: '138****8888',
  email: 'zhang@scu.edu.cn',
  guidanceCount: 45,
  projectCount: 12,
  ratingScore: 4.8
})

// 加载教师信息
const loadTeacherInfo = async () => {
  try {
    const res = await getTeacherInfo()
    teacherInfo.value = res.data
  } catch (error) {
    console.error('加载教师信息失败', error)
    showToast('加载教师信息失败')
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要退出登录吗？'
    })
    
    // TODO: 调用退出登录API
    // await logout()
    
    // 清除用户信息
    userStore.clearUserInfo()
    
    // 跳转到登录页
    router.replace('/login')
    showToast('已退出登录')
  } catch (error) {
    // 用户取消
  }
}

onMounted(() => {
  loadTeacherInfo()
})
</script>

<style scoped>
/* 自定义样式 */
</style>
