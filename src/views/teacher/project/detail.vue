<template>
  <div class="teacher-project-detail pb-24 min-h-screen bg-[#f7f8fa]">
    <!-- 返回按钮 -->
    <div
      class="fixed top-3 left-3 z-50 bg-black/20 rounded-full p-1.5 backdrop-blur-sm"
      @click="$router.back()"
    >
      <van-icon name="arrow-left" color="white" size="20" />
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="p-4 pt-20">
      <van-skeleton title avatar :row="3" />
      <van-skeleton title :row="5" class="mt-8" />
    </div>

    <!-- 项目详情 -->
    <div v-else>
      <!-- 顶部项目信息 -->
      <div class="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white pt-16 pb-16 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full translate-x-10 -translate-y-10"></div>
        <div class="flex items-start z-10 relative mt-4">
          <van-image
            width="64px"
            height="64px"
            radius="12px"
            :src="projectDetail.logo"
            class="mr-4 bg-white p-1 rounded-xl shadow-lg shrink-0"
          >
            <template #default>
              <div class="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                <van-icon name="bulb-o" size="32" color="#8b5cf6" />
              </div>
            </template>
          </van-image>
          <div class="flex-1 relative pr-16">
            <h1 class="text-xl font-bold mb-2 leading-snug">{{ projectDetail.projectName }}</h1>
            <div class="text-xs opacity-80 mb-2">{{ projectDetail.collegeName }}</div>
            <div class="absolute top-0 right-[-10px]">
              <van-tag :type="getStatusTagType(projectDetail.status)" mark size="medium">
                {{ getStatusLabel(projectDetail.status) }}
              </van-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 基本信息卡片 -->
      <div class="px-3 -mt-10 relative z-10 space-y-3">
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <div class="text-xs text-gray-400 mb-1">所属高校</div>
              <div class="text-sm font-bold text-gray-800 truncate">{{ projectDetail.schoolName }}</div>
            </div>
            <div class="border-l border-gray-100">
              <div class="text-xs text-gray-400 mb-1">团队规模</div>
              <div class="text-sm font-bold text-gray-800">{{ projectDetail.teamSize }}人</div>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-500 flex justify-between items-center">
            <div class="flex items-center">
              <van-icon name="manager" class="mr-1" /> 负责人: {{ projectDetail.studentName }}
            </div>
            <div class="flex items-center">
              <van-icon name="fire-o" class="mr-1" /> 领域: {{ getDomainLabel(projectDetail.domain) }}
            </div>
          </div>
        </div>

        <!-- 项目介绍 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="font-bold text-gray-800 mb-3 border-l-4 border-purple-500 pl-2 text-sm">项目介绍</h3>
          <div class="text-sm text-gray-600 leading-7 text-justify">
            {{ projectDetail.description || '暂无项目介绍' }}
          </div>
          <div class="mt-4 flex flex-wrap gap-2" v-if="projectDetail.tags && projectDetail.tags.length > 0">
            <van-tag v-for="tag in projectDetail.tags" :key="tag" color="#f3f0ff" text-color="#7c3aed" class="px-2 py-1">
              # {{ tag }}
            </van-tag>
          </div>
        </div>

        <!-- 指导记录 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-bold text-gray-800 border-l-4 border-blue-500 pl-2 text-sm">指导记录</h3>
            <span class="text-xs text-gray-400">共{{ guidanceList.length }}条</span>
          </div>

          <!-- 指导记录列表 -->
          <div v-if="guidanceList.length > 0" class="space-y-3">
            <div
              v-for="item in guidanceList"
              :key="item.id"
              class="bg-gray-50 rounded-lg p-3"
            >
              <div class="flex items-start gap-2 mb-2">
                <van-image
                  round
                  width="32px"
                  height="32px"
                  :src="item.teacherAvatar"
                  class="shrink-0"
                >
                  <template #default>
                    <div class="w-full h-full bg-purple-100 flex items-center justify-center">
                      <van-icon name="user-o" size="16" color="#8b5cf6" />
                    </div>
                  </template>
                </van-image>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium text-gray-800">{{ item.teacherName }}</span>
                    <span class="text-xs text-gray-400">{{ item.createTime }}</span>
                  </div>
                  <div class="text-sm text-gray-600 leading-relaxed">{{ item.content }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 暂无指导 -->
          <van-empty v-else description="暂无指导记录" image-size="80" />
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <van-action-bar style="z-index: 2000; padding-bottom: env(safe-area-inset-bottom);">
      <van-action-bar-button
        color="linear-gradient(to right, #8b5cf6, #7c3aed)"
        type="primary"
        text="发表指导意见"
        @click="showGuidanceDialog = true"
      />
    </van-action-bar>

    <!-- 发表指导对话框 -->
    <van-dialog
      v-model:show="showGuidanceDialog"
      title="发表指导意见"
      show-cancel-button
      :before-close="handleGuidanceSubmit"
    >
      <van-field
        v-model="guidanceContent"
        rows="5"
        autosize
        type="textarea"
        maxlength="500"
        placeholder="请输入您的指导意见（至少10个字）"
        show-word-limit
      />
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getTeacherProjectDetail, getProjectGuidanceList, addGuidance } from '@/api/teacher'

const route = useRoute()
const router = useRouter()

// 项目ID
const projectId = route.params.id as string

// 加载状态
const loading = ref(true)

// 项目详情
const projectDetail = ref<any>({})

// 指导记录列表
const guidanceList = ref<any[]>([])

// 指导对话框
const showGuidanceDialog = ref(false)
const guidanceContent = ref('')

// 加载项目详情
const loadProjectDetail = async () => {
  try {
    const res = await getTeacherProjectDetail(projectId)
    projectDetail.value = res.data
  } catch (error) {
    console.error('加载项目详情失败', error)
    showToast('加载项目详情失败')
  }
}

// 加载指导记录
const loadGuidanceList = async () => {
  try {
    const res = await getProjectGuidanceList(projectId)
    guidanceList.value = res.data || []
  } catch (error) {
    console.error('加载指导记录失败', error)
  }
}

// 提交指导意见
const handleGuidanceSubmit = async (action: string) => {
  if (action === 'confirm') {
    if (!guidanceContent.value || guidanceContent.value.trim().length < 10) {
      showToast('请输入至少10个字的指导意见')
      return false
    }

    const toast = showLoadingToast({
      message: '提交中...',
      forbidClick: true,
      duration: 0
    })

    try {
      await addGuidance({
        projectId: projectId,
        content: guidanceContent.value.trim()
      })

      closeToast()
      showToast('指导意见发表成功')
      guidanceContent.value = ''
      
      // 重新加载指导记录
      await loadGuidanceList()
      
      return true
    } catch (error) {
      closeToast()
      showToast('发表失败，请重试')
      return false
    }
  }
  return true
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    '0': 'warning',
    '1': 'success',
    '2': 'danger',
    '3': 'primary'
  }
  return map[status] || 'default'
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    '0': '待审核',
    '1': '孵化中',
    '2': '已驳回',
    '3': '已落地'
  }
  return map[status] || '未知'
}

// 获取领域标签
const getDomainLabel = (domain: string) => {
  if (!domain) return '未知'
  const map: Record<string, string> = {
    'INTERNET_PLUS': '互联网+',
    'CULTURE_CREATIVE': '文化创意',
    'SMART_AGRI': '智慧农业',
    'TECH_INNOVATION': '科技创新',
    'SOCIAL_SERVICE': '社会服务'
  }
  // 处理多个领域的情况
  const domains = domain.split(',')
  return domains.map(d => map[d] || d).join('、')
}

// 初始化
onMounted(async () => {
  loading.value = true
  await Promise.all([
    loadProjectDetail(),
    loadGuidanceList()
  ])
  loading.value = false
})
</script>

<style scoped>
:deep(.van-dialog__content) {
  padding: 16px;
}
</style>
