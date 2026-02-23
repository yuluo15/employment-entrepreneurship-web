<template>
  <div class="messages-page bg-[#f7f8fa] min-h-screen pb-4">
    <van-nav-bar
      title="消息通知"
      left-arrow
      fixed
      placeholder
      @click-left="$router.back()"
    >
      <template #right>
        <van-icon name="passed" @click="handleMarkAllRead" v-if="hasUnread" />
      </template>
    </van-nav-bar>

    <!-- Tab切换 -->
    <van-tabs v-model:active="activeTab" @change="onTabChange" sticky offset-top="46px">
      <van-tab title="全部" :name="undefined" />
      <van-tab title="面试通知" :name="2">
        <template #title>
          面试通知
          <van-badge v-if="unreadCount.interviewCount > 0" :content="unreadCount.interviewCount" class="ml-1" />
        </template>
      </van-tab>
      <van-tab title="Offer" :name="3">
        <template #title>
          Offer
          <van-badge v-if="unreadCount.offerCount > 0" :content="unreadCount.offerCount" class="ml-1" />
        </template>
      </van-tab>
      <van-tab title="系统通知" :name="1">
        <template #title>
          系统通知
          <van-badge v-if="unreadCount.systemCount > 0" :content="unreadCount.systemCount" class="ml-1" />
        </template>
      </van-tab>
    </van-tabs>

    <!-- 消息列表 -->
    <div class="p-3">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多消息了"
          @load="onLoad"
          :immediate-check="false"
        >
          <div
            v-for="item in list"
            :key="item.id"
            class="bg-white rounded-lg shadow-sm mb-3 p-4 relative"
            :class="{ 'border-l-4 border-blue-500': item.isRead === 0 }"
            @click="handleViewDetail(item)"
          >
            <!-- 未读标记 -->
            <div v-if="item.isRead === 0" class="absolute top-3 right-3">
              <div class="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>

            <!-- 消息头部 -->
            <div class="flex items-start gap-3 mb-2">
              <div class="shrink-0">
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center"
                  :style="{ backgroundColor: getTypeColor(item.type) + '20' }"
                >
                  <van-icon 
                    :name="getTypeIcon(item.type)" 
                    size="20" 
                    :color="getTypeColor(item.type)" 
                  />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <span 
                    class="font-bold text-gray-800 truncate"
                    :class="{ 'text-blue-600': item.isRead === 0 }"
                  >
                    {{ item.title }}
                  </span>
                  <van-tag 
                    :type="getTypeTagType(item.type)" 
                    size="medium"
                    class="ml-2 shrink-0"
                  >
                    {{ getTypeText(item.type) }}
                  </van-tag>
                </div>
                <div class="text-xs text-gray-500 mb-2">
                  {{ item.companyName }} · {{ item.positionName }}
                </div>
              </div>
            </div>

            <!-- 消息内容预览 -->
            <div class="text-sm text-gray-600 leading-relaxed mb-2 line-clamp-2">
              {{ getContentPreview(item.content) }}
            </div>

            <!-- 时间 -->
            <div class="text-xs text-gray-400">
              {{ formatRelativeTime(item.createTime) }}
            </div>
          </div>
        </van-list>
      </van-pull-refresh>

      <van-empty v-if="!loading && list.length === 0" description="暂无消息" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getMessages, getUnreadCount, markAllAsRead, type MessageItem } from '@/api/mobile/message'

const router = useRouter()

// Tab状态
const activeTab = ref<number | undefined>(undefined)

// 未读数量
const unreadCount = ref({
  total: 0,
  systemCount: 0,
  interviewCount: 0,
  offerCount: 0
})

// 列表数据
const list = ref<MessageItem[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const pageNum = ref(1)

// 是否有未读消息
const hasUnread = computed(() => unreadCount.value.total > 0)

onMounted(() => {
  loadUnreadCount()
  onLoad()
})

// 加载未读数量
const loadUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    unreadCount.value = res.data
  } catch (error) {
    console.error('获取未读数量失败', error)
  }
}

// 加载列表
const onLoad = async () => {
  if (refreshing.value) {
    list.value = []
    refreshing.value = false
  }

  if (loading.value) return
  loading.value = true

  try {
    const res = await getMessages({
      pageNum: pageNum.value,
      pageSize: 10,
      type: activeTab.value
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
  loadUnreadCount()
  onLoad()
}

// 查看详情
const handleViewDetail = (item: MessageItem) => {
  router.push(`/student/my/messages/${item.id}`)
}

// 一键已读
const handleMarkAllRead = async () => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: activeTab.value 
        ? `确定要将所有${getTypeText(activeTab.value)}标记为已读吗？` 
        : '确定要将所有消息标记为已读吗？'
    })

    await markAllAsRead(activeTab.value)
    showToast('已全部标记为已读')
    
    // 刷新列表
    onRefresh()
  } catch (error) {
    // 用户取消
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

// 获取内容预览
const getContentPreview = (content: string): string => {
  // 移除换行符，只显示前100个字符
  return content.replace(/\n/g, ' ').substring(0, 100)
}

// 格式化相对时间
const formatRelativeTime = (time: string): string => {
  const now = new Date().getTime()
  const msgTime = new Date(time).getTime()
  const diff = now - msgTime

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return time.split(' ')[0]
  }
}
</script>

<style scoped>
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
