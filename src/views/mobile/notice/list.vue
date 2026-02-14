<template>
  <div class="notice-list-page bg-[#f7f8fa] min-h-screen pb-4">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="通知公告"
      left-arrow
      fixed
      placeholder
      @click-left="$router.back()"
    />

    <!-- 筛选栏 -->
    <div class="bg-white px-3 py-2 mb-2">
      <van-dropdown-menu>
        <van-dropdown-item v-model="filterType" :options="typeOptions" @change="onFilterChange" />
        <van-dropdown-item v-model="filterPublisher" :options="publisherOptions" @change="onFilterChange" />
      </van-dropdown-menu>
    </div>

    <!-- 通知列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div
          v-for="notice in noticeList"
          :key="notice.noticeId"
          class="bg-white mx-3 mb-2 rounded-lg p-3 shadow-sm active:bg-gray-50 transition-colors"
          @click="toDetail(notice.noticeId)"
        >
          <div class="flex items-start gap-2 mb-2">
            <van-tag :type="getNoticeTagType(notice.noticeType)" size="small" class="shrink-0 mt-0.5">
              {{ notice.noticeTypeText }}
            </van-tag>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-800 line-clamp-2 mb-1 flex items-center gap-1">
                <van-icon v-if="notice.isTop" name="fire" color="#ee0a24" size="14" />
                {{ notice.noticeTitle }}
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs text-gray-400">
            <span class="flex items-center gap-1">
              <van-icon name="user-o" size="12" />
              {{ notice.publisherName }}
            </span>
            <span class="flex items-center gap-1">
              <van-icon name="clock-o" size="12" />
              {{ formatTime(notice.publishTime) }}
            </span>
            <span class="flex items-center gap-1">
              <van-icon name="eye-o" size="12" />
              {{ notice.viewCount }}
            </span>
          </div>
        </div>

        <van-empty v-if="!loading && noticeList.length === 0" description="暂无通知" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getNoticeList } from '@/api/mobile/notice'
import { showToast } from 'vant'

const router = useRouter()

// 筛选条件
const filterType = ref('')
const filterPublisher = ref('')

const typeOptions = [
  { text: '全部类型', value: '' },
  { text: '活动通知', value: 'ACTIVITY' },
  { text: '赛事通知', value: 'COMPETITION' },
  { text: '讲座通知', value: 'LECTURE' },
  { text: '政策通知', value: 'POLICY' },
  { text: '一般通知', value: 'GENERAL' }
]

const publisherOptions = [
  { text: '全部来源', value: '' },
  { text: '省教育厅', value: 'ADMIN' },
  { text: '本校通知', value: 'SCHOOL' }
]

// 列表数据
const noticeList = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const pageNum = ref(1)
const pageSize = 10

// 加载数据
const onLoad = async () => {
  try {
    const res = await getNoticeList({
      pageNum: pageNum.value,
      pageSize,
      noticeType: filterType.value || undefined,
      publisherType: filterPublisher.value || undefined
    })

    const list = res.data?.data || []
    
    if (refreshing.value) {
      noticeList.value = list
      refreshing.value = false
    } else {
      noticeList.value.push(...list)
    }

    // 判断是否还有更多数据
    if (list.length < pageSize) {
      finished.value = true
    } else {
      pageNum.value++
    }
  } catch (error) {
    console.error('加载通知失败', error)
    showToast('加载失败')
    finished.value = true
  } finally {
    loading.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  pageNum.value = 1
  finished.value = false
  noticeList.value = []
  onLoad()
}

// 筛选条件变化
const onFilterChange = () => {
  pageNum.value = 1
  finished.value = false
  noticeList.value = []
  onLoad()
}

// 获取通知类型标签颜色
const getNoticeTagType = (type: string) => {
  const map: Record<string, string> = {
    'ACTIVITY': 'primary',
    'COMPETITION': 'warning',
    'LECTURE': 'success',
    'POLICY': 'danger',
    'GENERAL': 'default'
  }
  return map[type] || 'default'
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 1小时内
  if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前'
  }
  // 24小时内
  if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前'
  }
  // 7天内
  if (diff < 604800000) {
    return Math.floor(diff / 86400000) + '天前'
  }
  // 超过7天显示日期
  return time.substring(0, 10)
}

// 跳转详情
const toDetail = (noticeId: string) => {
  router.push(`/student/notice/${noticeId}`)
}

onMounted(() => {
  onLoad()
})
</script>
