<template>
  <div class="message-detail-page bg-[#f7f8fa] min-h-screen pb-4">
    <van-nav-bar
      title="消息详情"
      left-arrow
      fixed
      placeholder
      @click-left="$router.back()"
    />

    <div v-if="loading" class="p-4">
      <van-skeleton title :row="8" />
    </div>

    <div v-else-if="message" class="p-3">
      <!-- 消息卡片 -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-3">
        <!-- 消息头部 -->
        <div class="flex items-start gap-3 mb-4">
          <div class="shrink-0">
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: getTypeColor(message.type) + '20' }"
            >
              <van-icon 
                :name="getTypeIcon(message.type)" 
                size="24" 
                :color="getTypeColor(message.type)" 
              />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-2">
              <van-tag 
                :type="getTypeTagType(message.type)" 
                size="large"
              >
                {{ getTypeText(message.type) }}
              </van-tag>
            </div>
            <h2 class="text-lg font-bold text-gray-800 mb-2">
              {{ message.title }}
            </h2>
            <div class="text-xs text-gray-400">
              {{ message.createTime }}
            </div>
          </div>
        </div>

        <!-- 分隔线 -->
        <van-divider />

        <!-- 消息内容 -->
        <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
          {{ message.content }}
        </div>

        <!-- 关联信息 -->
        <div v-if="message.companyName || message.positionName" class="bg-gray-50 rounded-lg p-3">
          <div class="text-xs text-gray-500 mb-2">相关信息</div>
          <div class="flex items-center gap-2 text-sm">
            <van-tag color="#f3f0ff" text-color="#7c3aed" size="medium">
              {{ message.companyName }}
            </van-tag>
            <span class="text-gray-400">·</span>
            <span class="text-gray-700">{{ message.positionName }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div v-if="message.positionId || message.applicationId" class="space-y-2">
        <van-button
          v-if="message.positionId"
          block
          round
          type="primary"
          @click="handleViewPosition"
        >
          <van-icon name="description" class="mr-1" />
          查看职位详情
        </van-button>
        <van-button
          v-if="message.applicationId"
          block
          round
          plain
          type="primary"
          @click="handleViewApplication"
        >
          <van-icon name="records" class="mr-1" />
          查看投递记录
        </van-button>
      </div>
    </div>

    <van-empty v-else description="消息不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getMessageDetail, type MessageDetail } from '@/api/mobile/message'

const route = useRoute()
const router = useRouter()

const messageId = route.params.id as string

const loading = ref(true)
const message = ref<MessageDetail | null>(null)

onMounted(async () => {
  await loadMessageDetail()
})

// 加载消息详情
const loadMessageDetail = async () => {
  loading.value = true
  try {
    const res = await getMessageDetail(messageId)
    message.value = res.data
  } catch (error: any) {
    showToast(error?.response?.data?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 查看职位详情
const handleViewPosition = () => {
  if (message.value?.positionId) {
    router.push(`/student/job/${message.value.positionId}`)
  }
}

// 查看投递记录
const handleViewApplication = () => {
  if (message.value?.applicationId) {
    router.push(`/student/my/delivery`)
  }
}

// 获取消息类型文本
const getTypeText = (type: number): string => {
  const map: Record<number, string> = {
    1: '系统通知',
    2: '面试通知',
    3: 'Offer通知'
  }
  return map[type] || '未知'
}

// 获取消息类型图标
const getTypeIcon = (type: number): string => {
  const map: Record<number, string> = {
    1: 'info-o',
    2: 'calendar-o',
    3: 'award-o'
  }
  return map[type] || 'info-o'
}

// 获取消息类型颜色
const getTypeColor = (type: number): string => {
  const map: Record<number, string> = {
    1: '#1989fa',
    2: '#ff976a',
    3: '#07c160'
  }
  return map[type] || '#999'
}

// 获取消息类型标签类型
const getTypeTagType = (type: number): string => {
  const map: Record<number, string> = {
    1: 'primary',
    2: 'warning',
    3: 'success'
  }
  return map[type] || 'default'
}
</script>
