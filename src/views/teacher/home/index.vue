<template>
  <div class="teacher-home min-h-screen bg-[#f7f8fa]">
    <!-- 顶部信息卡片 -->
    <div class="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 pt-6 pb-8">
      <div class="flex items-center mb-4">
        <van-image
          round
          width="60px"
          height="60px"
          :src="teacherInfo.avatar"
          class="mr-4 border-2 border-white"
        >
          <template #default>
            <div class="w-full h-full bg-white/20 flex items-center justify-center">
              <van-icon name="user-o" size="30" color="white" />
            </div>
          </template>
        </van-image>
        <div class="flex-1 text-white">
          <div class="text-lg font-bold mb-1">{{ teacherInfo.name || '教师' }}</div>
          <div class="text-sm opacity-90">{{ teacherInfo.title }} · {{ teacherInfo.collegeName }}</div>
          <div class="text-xs opacity-75 mt-1">{{ teacherInfo.schoolName }}</div>
        </div>
      </div>

      <!-- KPI卡片 -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-white">{{ stats.guidanceCount }}</div>
          <div class="text-xs text-white/80 mt-1">指导次数</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-white">{{ stats.projectCount }}</div>
          <div class="text-xs text-white/80 mt-1">指导项目</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-white">{{ stats.ratingScore }}</div>
          <div class="text-xs text-white/80 mt-1">评分</div>
        </div>
      </div>
    </div>

    <div class="px-3 -mt-4 pb-20">
      <!-- 待办事项 -->
      <van-cell-group :border="false" class="rounded-lg shadow-sm mb-3">
        <van-cell
          title="待指导项目"
          :value="`${pendingProjects.length}个`"
          is-link
          @click="$router.push('/teacher/projects?status=pending')"
          class="font-medium"
        >
          <template #icon>
            <van-icon name="clock-o" size="20" color="#f59e0b" class="mr-3" />
          </template>
        </van-cell>
        <van-cell
          title="本周新增项目"
          :value="`${stats.weekNewCount}个`"
          is-link
          @click="$router.push('/teacher/projects?scope=school')"
          class="font-medium"
        >
          <template #icon>
            <van-icon name="fire-o" size="20" color="#ef4444" class="mr-3" />
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 待指导项目列表 -->
      <div class="mb-3" v-if="pendingProjects.length > 0">
        <div class="flex justify-between items-center px-1 mb-2">
          <span class="text-sm font-bold text-gray-800">待指导项目</span>
          <span class="text-xs text-gray-400" @click="$router.push('/teacher/projects?status=pending')">
            查看全部 <van-icon name="arrow" />
          </span>
        </div>
        <div
          v-for="project in pendingProjects"
          :key="project.projectId"
          class="bg-white p-4 rounded-lg shadow-sm mb-2 active:bg-gray-50"
          @click="toProjectDetail(project.projectId)"
        >
          <div class="flex items-start gap-3">
            <van-image
              width="48px"
              height="48px"
              radius="4px"
              :src="project.logo"
              class="bg-gray-50 border border-gray-100 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="font-bold text-sm text-gray-800 mb-1">{{ project.projectName }}</div>
              <div class="text-xs text-gray-500 mb-2">
                {{ project.studentName }} · {{ project.domain }}
              </div>
              <div class="flex items-center justify-between">
                <van-tag plain type="warning" size="small">待指导</van-tag>
                <span class="text-xs text-gray-400">{{ project.createTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="bg-white rounded-lg shadow-sm p-3 mb-3">
        <div class="text-sm font-bold text-gray-800 mb-3 px-1">快捷入口</div>
        <van-grid :border="false" :column-num="4">
          <van-grid-item icon="bulb-o" text="全网项目" @click="$router.push('/teacher/projects?scope=all')" />
          <van-grid-item icon="shop-o" text="本校项目" @click="$router.push('/teacher/projects?scope=school')" />
          <van-grid-item icon="records-o" text="指导记录" @click="$router.push('/teacher/guidance')" />
          <van-grid-item icon="chart-trending-o" text="数据统计" @click="showToast('功能开发中')" />
        </van-grid>
      </div>

      <!-- 最近指导 -->
      <div v-if="recentGuidance.length > 0">
        <div class="flex justify-between items-center px-1 mb-2">
          <span class="text-sm font-bold text-gray-800">最近指导</span>
          <span class="text-xs text-gray-400" @click="$router.push('/teacher/guidance')">
            查看全部 <van-icon name="arrow" />
          </span>
        </div>
        <van-cell-group :border="false" class="rounded-lg shadow-sm">
          <van-cell
            v-for="item in recentGuidance"
            :key="item.id"
            :title="item.projectName"
            :label="item.content"
            @click="toProjectDetail(item.projectId)"
          >
            <template #right-icon>
              <span class="text-xs text-gray-400">{{ item.createTime }}</span>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useTeacherStore } from '@/store/teacherStore'
import { getTeacherDashboard } from '@/api/teacher'

defineOptions({ name: 'TeacherHome' })

const router = useRouter()
const teacherStore = useTeacherStore()

// 教师信息
const teacherInfo = ref({
  name: '张教授',
  avatar: '',
  title: '教授',
  collegeName: '计算机学院',
  schoolName: '四川大学'
})

// 统计数据
const stats = ref({
  guidanceCount: 0,
  projectCount: 0,
  ratingScore: 0,
  weekNewCount: 0
})

// 待指导项目
const pendingProjects = ref<any[]>([])

// 最近指导
const recentGuidance = ref<any[]>([])

// 加载数据
const loadData = async () => {
  try {
    const res = await getTeacherDashboard()
    const data = res.data
    
    // 更新教师信息
    teacherInfo.value = {
      name: data.teacherInfo.name,
      avatar: data.teacherInfo.avatar,
      title: data.teacherInfo.title,
      collegeName: data.teacherInfo.collegeName,
      schoolName: data.teacherInfo.schoolName
    }
    
    // 更新统计数据
    stats.value = {
      guidanceCount: data.stats.guidanceCount,
      projectCount: data.stats.projectCount,
      ratingScore: data.stats.ratingScore,
      weekNewCount: data.stats.weekNewCount
    }
    
    // 更新待指导项目
    pendingProjects.value = data.pendingProjects || []
    
    // 更新最近指导
    recentGuidance.value = data.recentGuidance || []
    
    // 更新 teacherStore 中的待办数量
    teacherStore.updatePendingCount(pendingProjects.value.length)
  } catch (error) {
    console.error('加载数据失败', error)
    showToast('加载数据失败')
  }
}

// 跳转项目详情
const toProjectDetail = (projectId: string) => {
  router.push(`/teacher/project/${projectId}`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 自定义样式 */
</style>
