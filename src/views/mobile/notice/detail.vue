<template>
  <div class="notice-detail-page bg-[#f7f8fa] min-h-screen">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="通知详情"
      left-arrow
      fixed
      placeholder
      @click-left="$router.back()"
    />

    <van-loading v-if="loading" class="flex justify-center items-center h-60" />

    <div v-else-if="notice" class="p-3">
      <!-- 通知头部 -->
      <div class="bg-white rounded-lg p-4 mb-3 shadow-sm">
        <div class="flex items-center gap-2 mb-3">
          <van-tag :type="getNoticeTagType(notice.noticeType)" size="medium">
            {{ notice.noticeTypeText }}
          </van-tag>
          <van-tag v-if="notice.isTop" color="#fee2e2" text-color="#dc2626" size="medium">
            <van-icon name="fire" class="mr-1" />置顶
          </van-tag>
        </div>

        <h1 class="text-lg font-bold text-gray-800 mb-3 leading-relaxed">
          {{ notice.noticeTitle }}
        </h1>

        <div class="flex items-center justify-between text-xs text-gray-400 pb-3 border-b border-gray-100">
          <span class="flex items-center gap-1">
            <van-icon name="user-o" size="14" />
            {{ notice.publisherName }}
          </span>
          <span class="flex items-center gap-1">
            <van-icon name="clock-o" size="14" />
            {{ notice.publishTime }}
          </span>
          <span class="flex items-center gap-1">
            <van-icon name="eye-o" size="14" />
            {{ notice.viewCount }}
          </span>
        </div>
      </div>

      <!-- 通知内容 -->
      <div class="bg-white rounded-lg p-4 mb-3 shadow-sm">
        <div 
          class="notice-content text-sm text-gray-700 leading-relaxed"
          v-html="notice.noticeContent"
        ></div>
      </div>

      <!-- 附件列表 -->
      <div v-if="notice.attachments && notice.attachments.length > 0" class="bg-white rounded-lg p-4 shadow-sm">
        <div class="text-sm font-medium text-gray-800 mb-3 flex items-center">
          <van-icon name="paperclip" class="mr-1" />
          附件下载
        </div>
        <div class="space-y-2">
          <div
            v-for="(file, index) in notice.attachments"
            :key="index"
            class="flex items-center justify-between p-2 bg-gray-50 rounded active:bg-gray-100 transition-colors"
            @click="downloadFile(file)"
          >
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <van-icon name="description" size="20" color="#3b82f6" />
              <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-800 truncate">{{ file.name }}</div>
                <div class="text-xs text-gray-400">{{ file.size }}</div>
              </div>
            </div>
            <van-icon name="down" color="#3b82f6" />
          </div>
        </div>
      </div>
    </div>

    <van-empty v-else description="通知不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getNoticeDetail } from '@/api/mobile/notice'
import { showToast } from 'vant'

const route = useRoute()
const noticeId = route.params.id as string

const loading = ref(true)
const notice = ref<any>(null)

// 加载通知详情
const loadDetail = async () => {
  try {
    const res = await getNoticeDetail(noticeId)
    notice.value = res.data
  } catch (error) {
    console.error('加载通知详情失败', error)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
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

// 下载附件
const downloadFile = (file: any) => {
  if (file.url) {
    window.open(file.url, '_blank')
  } else {
    showToast('附件链接无效')
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.notice-content {
  word-wrap: break-word;
  word-break: break-all;
}

.notice-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 8px 0;
}

.notice-content :deep(p) {
  margin: 8px 0;
  line-height: 1.6;
}

.notice-content :deep(h1),
.notice-content :deep(h2),
.notice-content :deep(h3) {
  font-weight: 600;
  margin: 12px 0 8px;
  color: #1f2937;
}

.notice-content :deep(ul),
.notice-content :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

.notice-content :deep(li) {
  margin: 4px 0;
}

.notice-content :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}
</style>
