<template>
  <div class="joined-projects bg-[#f7f8fa] min-h-screen pb-4">
    <van-nav-bar
      title="我加入的项目"
      left-arrow
      fixed
      placeholder
      @click-left="$router.back()"
    />

    <!-- Tab切换 -->
    <van-tabs v-model:active="activeTab" @change="onTabChange" sticky offset-top="46px">
      <van-tab title="全部" name="">
        <template #title>
          全部
          <van-badge v-if="stats.totalCount > 0" :content="stats.totalCount" class="ml-1" />
        </template>
      </van-tab>
      <van-tab title="待审核" name="PENDING">
        <template #title>
          待审核
          <van-badge v-if="stats.pendingCount > 0" :content="stats.pendingCount" class="ml-1" />
        </template>
      </van-tab>
      <van-tab title="已通过" name="APPROVED" />
      <van-tab title="已拒绝" name="REJECTED" />
    </van-tabs>

    <!-- 项目列表 -->
    <div class="p-3">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多项目了"
          @load="onLoad"
          :immediate-check="false"
        >
          <div
            v-for="item in list"
            :key="item.applicationId"
            class="bg-white rounded-lg shadow-sm mb-3 p-4"
            @click="toProjectDetail(item.projectId)"
          >
            <!-- 项目信息 -->
            <div class="flex items-start gap-3 mb-3">
              <van-image
                width="56px"
                height="56px"
                radius="8px"
                :src="item.logo"
                class="bg-gray-50 border border-gray-100 shrink-0"
              >
                <template #default>
                  <div class="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                    <van-icon name="bulb-o" size="24" color="#8b5cf6" />
                  </div>
                </template>
              </van-image>

              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-bold text-gray-800 line-clamp-1 flex-1">{{ item.projectName }}</span>
                  <van-tag :type="getStatusType(item.status)" size="medium" class="ml-2 shrink-0">
                    {{ getStatusText(item.status) }}
                  </van-tag>
                </div>
                <div class="text-xs text-gray-500 mb-2">
                  负责人：{{ item.leaderName }} · 团队{{ item.teamSize }}人
                </div>
                <van-tag color="#f3f4f6" text-color="#7c3aed" size="small">
                  {{ item.domain }}
                </van-tag>
              </div>
            </div>

            <!-- 申请理由 -->
            <div class="bg-gray-50 rounded-lg p-3 mb-2">
              <div class="text-xs text-gray-500 mb-1">申请理由</div>
              <div class="text-sm text-gray-700 line-clamp-2">{{ item.applicationReason }}</div>
            </div>

            <!-- 回复消息 -->
            <div v-if="item.replyMessage" class="bg-blue-50 rounded-lg p-3 mb-2">
              <div class="text-xs text-blue-600 mb-1">
                {{ item.status === 'APPROVED' ? '通过消息' : '拒绝原因' }}
              </div>
              <div class="text-sm text-blue-800">{{ item.replyMessage }}</div>
            </div>

            <!-- 时间信息 -->
            <div class="text-xs text-gray-400">
              申请时间：{{ item.applyTime }}
              <span v-if="item.replyTime"> · 处理时间：{{ item.replyTime }}</span>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>

      <van-empty v-if="!loading && list.length === 0" description="暂无申请记录" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getMyJoinedProjects } from '@/api/mobile/project'

const router = useRouter()

// Tab状态
const activeTab = ref('')

// 统计数据
const stats = ref({
  totalCount: 0,
  pendingCount: 0
})

// 列表数据
const list = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const pageNum = ref(1)

onMounted(() => {
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
    const res = await getMyJoinedProjects({
      pageNum: pageNum.value,
      pageSize: 10,
      status: activeTab.value || undefined
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

    // 更新统计数据（从第一页获取）
    if (pageNum.value === 2 && data.stats) {
      stats.value = data.stats
    }
  } catch (error) {
    finished.value = true
    showToast('加载失败')
  } finally {
    loading.value = false
  }
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

// 跳转项目详情
const toProjectDetail = (projectId: string) => {
  router.push(`/student/project/${projectId}`)
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
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:deep(.van-tabs__nav) {
  background-color: white;
}
</style>
