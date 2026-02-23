<template>
  <div class="project-applications bg-[#f7f8fa] min-h-screen pb-4">
    <van-nav-bar
      :title="projectName || '申请列表'"
      left-arrow
      fixed
      placeholder
      @click-left="$router.back()"
    />

    <!-- Tab切换 -->
    <van-tabs v-model:active="activeTab" @change="onTabChange" sticky offset-top="46px">
      <van-tab title="全部" name="all" />
      <van-tab title="待审核" name="PENDING">
        <template #title>
          待审核
          <van-badge v-if="stats.pendingCount > 0" :content="stats.pendingCount" class="ml-1" />
        </template>
      </van-tab>
      <van-tab title="已通过" name="APPROVED" />
      <van-tab title="已拒绝" name="REJECTED" />
    </van-tabs>

    <!-- 申请列表 -->
    <div class="p-3">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多申请了"
          @load="onLoad"
          :immediate-check="false"
        >
          <div
            v-for="item in list"
            :key="item.id"
            class="bg-white rounded-lg shadow-sm mb-3 p-4"
          >
            <!-- 申请人信息 -->
            <div class="flex items-start gap-3 mb-3">
              <van-image
                round
                width="48px"
                height="48px"
                :src="item.applicantAvatar"
                class="shrink-0"
              >
                <template #default>
                  <div class="w-full h-full bg-purple-100 flex items-center justify-center">
                    <van-icon name="user-o" size="24" color="#8b5cf6" />
                  </div>
                </template>
              </van-image>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-bold text-gray-800">{{ item.applicantName }}</span>
                  <van-tag :type="getStatusType(item.status)" size="medium">
                    {{ getStatusText(item.status) }}
                  </van-tag>
                </div>
                <div class="text-xs text-gray-500">
                  {{ item.applicantSchool }} · {{ item.applicantMajor }}
                </div>
              </div>
            </div>

            <!-- 申请理由 -->
            <div class="bg-gray-50 rounded-lg p-3 mb-3">
              <div class="text-xs text-gray-500 mb-1">申请理由</div>
              <div class="text-sm text-gray-700 leading-relaxed">{{ item.applicationReason }}</div>
            </div>

            <!-- 个人技能 -->
            <div v-if="item.skills" class="mb-3">
              <div class="text-xs text-gray-500 mb-1">个人技能</div>
              <div class="flex flex-wrap gap-2">
                <van-tag
                  v-for="skill in item.skills.split(',')"
                  :key="skill"
                  color="#f3f0ff"
                  text-color="#7c3aed"
                  size="medium"
                >
                  {{ skill.trim() }}
                </van-tag>
              </div>
            </div>

            <!-- 回复消息 -->
            <div v-if="item.replyMessage" class="bg-blue-50 rounded-lg p-3 mb-3">
              <div class="text-xs text-blue-600 mb-1">回复消息</div>
              <div class="text-sm text-blue-800">{{ item.replyMessage }}</div>
            </div>

            <!-- 时间信息 -->
            <div class="text-xs text-gray-400 mb-3">
              申请时间：{{ item.createTime }}
              <span v-if="item.replyTime"> · 处理时间：{{ item.replyTime }}</span>
            </div>

            <!-- 操作按钮 -->
            <div v-if="item.status === 'PENDING'" class="flex gap-2">
              <van-button
                block
                round
                type="danger"
                size="small"
                @click="handleReject(item)"
              >
                拒绝
              </van-button>
              <van-button
                block
                round
                type="success"
                size="small"
                @click="handleApprove(item)"
              >
                通过
              </van-button>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>

      <van-empty v-if="!loading && list.length === 0" description="暂无申请记录" />
    </div>

    <!-- 处理申请对话框 -->
    <van-dialog
      v-model:show="showReplyDialog"
      :title="dialogTitle"
      show-cancel-button
      :before-close="handleSubmit"
    >
      <div class="p-4">
        <van-field
          v-model="replyMessage"
          rows="4"
          autosize
          type="textarea"
          maxlength="200"
          :placeholder="dialogPlaceholder"
          show-word-limit
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getProjectApplications, handleApplication } from '@/api/mobile/project'

const route = useRoute()
const router = useRouter()

const projectId = route.params.projectId as string
const projectName = ref('')

// Tab状态
const activeTab = ref('all')

// 统计数据
const stats = ref({
  totalCount: 0,
  pendingCount: 0,
  approvedCount: 0,
  rejectedCount: 0
})

// 列表数据
const list = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const pageNum = ref(1)

// 对话框
const showReplyDialog = ref(false)
const replyMessage = ref('')
const currentApplication = ref<any>(null)
const currentAction = ref<'APPROVE' | 'REJECT'>('APPROVE')

const dialogTitle = computed(() => {
  return currentAction.value === 'APPROVE' ? '通过申请' : '拒绝申请'
})

const dialogPlaceholder = computed(() => {
  return currentAction.value === 'APPROVE' 
    ? '欢迎加入我们的团队！（选填）' 
    : '请说明拒绝理由（建议填写）'
})

onMounted(() => {
  // 从路由query中获取项目名称
  projectName.value = (route.query.projectName as string) || ''
  // 手动触发第一次加载
  onLoad()
})

// 加载列表
const onLoad = async () => {
  if (refreshing.value) {
    list.value = []
    refreshing.value = false
  }

  if (loading.value) return
  loading.value = true

  try {
    const status = activeTab.value === 'all' ? undefined : activeTab.value
    const res = await getProjectApplications(projectId, {
      pageNum: pageNum.value,
      pageSize: 10,
      status
    })

    const data = res.data
    const records = data.data || []

    if (records.length === 0) {
      finished.value = true
    } else {
      list.value.push(...records)
      pageNum.value++
      if (records.length < 10) {
        finished.value = true
      }
    }

    // 更新统计数据（从第一页数据中获取）
    if (pageNum.value === 2) {
      updateStats()
    }
  } catch (error) {
    finished.value = true
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

// 更新统计数据
const updateStats = () => {
  // 简单统计，实际应该从后端获取
  stats.value.pendingCount = list.value.filter(item => item.status === 'PENDING').length
}

// Tab切换
const onTabChange = () => {
  pageNum.value = 1
  finished.value = false
  list.value = []
  onLoad()
}

// 下拉刷新
const onRefresh = () => {
  finished.value = false
  pageNum.value = 1
  loading.value = false
  onLoad()
}

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    'PENDING': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'danger'
  }
  return map[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    'PENDING': '待审核',
    'APPROVED': '已通过',
    'REJECTED': '已拒绝'
  }
  return map[status] || '未知'
}

// 通过申请
const handleApprove = (item: any) => {
  currentApplication.value = item
  currentAction.value = 'APPROVE'
  replyMessage.value = ''
  showReplyDialog.value = true
}

// 拒绝申请
const handleReject = (item: any) => {
  currentApplication.value = item
  currentAction.value = 'REJECT'
  replyMessage.value = ''
  showReplyDialog.value = true
}

// 提交处理
const handleSubmit = async (action: string) => {
  if (action === 'confirm') {
    if (currentAction.value === 'REJECT' && !replyMessage.value.trim()) {
      showToast('请填写拒绝理由')
      return false
    }

    const toast = showLoadingToast({
      message: '处理中...',
      forbidClick: true,
      duration: 0
    })

    try {
      await handleApplication(currentApplication.value.id, {
        action: currentAction.value,
        replyMessage: replyMessage.value.trim() || undefined
      })

      closeToast()
      showToast(currentAction.value === 'APPROVE' ? '已通过申请' : '已拒绝申请')

      // 刷新列表
      onRefresh()

      return true
    } catch (error: any) {
      closeToast()
      const msg = error?.response?.data?.message || '处理失败，请重试'
      showToast(msg)
      return false
    }
  }
  return true
}
</script>

<style scoped>
:deep(.van-tabs__nav) {
  background-color: white;
}
</style>
