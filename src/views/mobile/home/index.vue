<template>
  <div class="mobile-home pb-4">
    <div class="sticky top-0 z-50 bg-white flex items-center px-2 py-1 shadow-sm">
      <div class="flex-1" @click="toSearchPage">
        <van-search
            v-model="dummySearch"
            shape="round"
            placeholder="搜索职位 / 公司 / 创业项目"
            readonly
        />
      </div>
    </div>

    <div class="px-3 pt-2">
      <van-swipe class="rounded-lg overflow-hidden h-40" :autoplay="4000" indicator-color="white">
        <van-swipe-item v-for="(img, idx) in banners" :key="idx">
          <div
              class="w-full h-full flex items-center justify-center text-white text-lg font-bold bg-cover bg-center"
              :style="{ backgroundImage: `url(${img.url})`, backgroundColor: img.color }"
          >
            {{ img.title }}
          </div>
        </van-swipe-item>
      </van-swipe>
    </div>

    <!-- AI推荐模块 -->
    <div class="mt-3 bg-white mx-3 rounded-lg p-3 shadow-sm">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-base font-bold text-gray-800 flex items-center">
          <van-icon name="fire" color="#ee0a24" class="mr-1" />
          AI为你推荐
        </h3>
      </div>

      <van-loading v-if="aiLoading" class="text-center py-4" />

      <div v-else-if="recommendedJobs.length > 0" class="space-y-3">
        <div
          v-for="job in recommendedJobs"
          :key="job.jobId"
          class="border border-gray-100 p-3 rounded-lg active:bg-gray-50 transition-colors"
          @click="toJobDetail(job.jobId)"
        >
          <!-- 匹配度标签 -->
          <div class="flex items-center justify-between mb-2">
            <van-tag 
              :type="getMatchType(job.matchScore)" 
              size="medium"
            >
              🎯 匹配度 {{ job.matchScore }}%
            </van-tag>
            <van-tag plain type="primary" size="small">AI推荐</van-tag>
          </div>

          <!-- 职位信息 -->
          <div class="font-bold text-base text-gray-800 mb-2">
            {{ job.title }}
          </div>

          <div class="flex items-center text-sm text-gray-600 mb-2 flex-wrap gap-2">
            <span class="text-blue-600 font-medium">{{ job.salaryRange }}</span>
            <span>{{ job.location }}</span>
            <span class="text-gray-400">{{ job.companyName }}</span>
          </div>

          <!-- 推荐理由 -->
          <div class="flex items-start gap-1 text-xs text-gray-500 bg-blue-50 p-2 rounded">
            <van-icon name="info-o" size="14" color="#3b82f6" class="mt-0.5 shrink-0" />
            <span>{{ job.recommendReason }}</span>
          </div>
        </div>
      </div>

      <van-empty 
        v-else
        description="暂无推荐职位，完善简历后获得更多推荐"
        image-size="80"
      >
        <van-button type="primary" size="small" @click="toResume">
          完善简历
        </van-button>
      </van-empty>
    </div>

    <div class="mt-3 bg-white mx-3 rounded-lg p-3 shadow-sm">
      <div class="flex justify-between items-center mb-2">
        <div class="text-sm font-bold text-gray-800 flex items-center">
          <van-icon name="bell" color="#3b82f6" class="mr-1" /> 通知公告
        </div>
        <span class="text-xs text-gray-400 flex items-center" @click="toNoticeList">
          更多 <van-icon name="arrow" />
        </span>
      </div>
      
      <div v-if="notices.length > 0" class="space-y-2">
        <div
          v-for="notice in notices"
          :key="notice.noticeId"
          class="flex items-start gap-2 p-2 rounded active:bg-gray-50 transition-colors"
          @click="toNoticeDetail(notice.noticeId)"
        >
          <van-tag :type="getNoticeTagType(notice.noticeType)" size="small" class="shrink-0 mt-0.5">
            {{ notice.noticeTypeText }}
          </van-tag>
          <div class="flex-1 min-w-0">
            <div class="text-sm text-gray-800 line-clamp-1 mb-1 flex items-center gap-1">
              <van-icon v-if="notice.isTop" name="fire" color="#ee0a24" size="12" />
              {{ notice.noticeTitle }}
            </div>
            <div class="text-xs text-gray-400 flex items-center justify-between">
              <span>{{ notice.publisherName }}</span>
              <span class="flex items-center gap-1">
                <van-icon name="eye-o" size="10" />
                {{ notice.viewCount }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <van-empty v-else description="暂无通知" image-size="60" />
    </div>

    <div class="mt-3 px-3">
      <div class="flex justify-between items-end mb-3">
        <h3 class="text-base font-bold text-gray-800">
          <span class="border-l-4 border-blue-500 pl-2">急招职位</span>
        </h3>
        <span class="text-xs text-gray-400 flex items-center" @click="toSearchPage">
          更多 <van-icon name="arrow" />
        </span>
      </div>

      <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
      >
        <div
            v-for="item in jobList"
            :key="item.id"
            class="bg-white p-4 rounded-lg shadow-sm mb-3 active:bg-gray-50 transition-colors"
            @click="toDetail(item)"
        >
          <div class="flex justify-between items-start mb-2">
            <span class="font-bold text-base text-gray-800 line-clamp-1">{{ item.title }}</span>
            <span class="text-blue-600 font-bold text-sm shrink-0">{{ item.highlight }}</span>
          </div>

<!--          <div class="flex items-center text-xs text-gray-500 mb-2">-->
<!--            <span>{{ item.subTitle.split('|')[0] }}</span> <span class="mx-1.5 h-3 w-[1px] bg-gray-300" v-if="item.subTitle.includes('|')"></span>-->
<!--            <span v-if="item.subTitle.includes('|')">{{ item.subTitle.split('|')[1] }}</span> <span class="mx-1.5 h-3 w-[1px] bg-gray-300"></span>-->
<!--            <span>{{ item.location }}</span>-->
<!--          </div>-->
          <div class="flex items-center text-xs text-gray-500 mb-2">
            <template v-if="item.subTitle">
              <span>{{ item.subTitle.split('|')[0] }}</span>
              <span class="mx-1.5 h-3 w-[1px] bg-gray-300" v-if="item.subTitle.includes('|')"></span>
              <span v-if="item.subTitle.includes('|')">{{ item.subTitle.split('|')[1] }}</span>
              <span class="mx-1.5 h-3 w-[1px] bg-gray-300"></span>
            </template>
            <span>{{ item.location }}</span>
          </div>

          <div class="flex flex-wrap gap-2 mb-3">
            <van-tag
                v-for="tag in item.tags"
                :key="tag"
                color="#f3f4f6"
                text-color="#6b7280"
                class="px-1.5 py-0.5"
            >
              {{ tag }}
            </van-tag>
          </div>

          <div class="pt-2 border-t border-gray-100 flex items-center">
            <van-image
                round
                width="20px"
                height="20px"
                :src="item.avatar"
                class="mr-2 shrink-0 bg-gray-100"
            />
            <span class="text-xs text-gray-400 truncate">{{ item.nickName }}</span>
          </div>
        </div>
      </van-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { searchApi, type SearchResultVo } from '@/api/mobile/job'
import { getHomeNotices } from '@/api/mobile/notice'
import { getAIRecommendJobs, type JobRecommendationVO } from '@/api/mobile/ai'

defineOptions({ name: 'StudentHome' })

const router = useRouter()
const dummySearch = ref('')
const banners = [
  { title: '2026届校园双选会', color: '#3b82f6', url: '' },
  { title: '大学生创业创新大赛报名', color: '#8b5cf6', url: '' },
  { title: '简历门诊：资深HR在线修改', color: '#f59e0b', url: '' }
]

const loading = ref(false)
const finished = ref(false)
const jobList = ref<SearchResultVo[]>([])
const pageNum = ref(1)

// 通知公告
const notices = ref<any[]>([])

// AI推荐
const aiLoading = ref(true)
const recommendedJobs = ref<JobRecommendationVO[]>([])

// 2. 同样的滚动条保持逻辑 (首页通常也需要)
const scrollTop = ref(0)

onBeforeRouteLeave((to, from, next) => {
  const container = document.querySelector('.mobile-layout')
  if (container) scrollTop.value = container.scrollTop || 0
  next()
})

onActivated(() => {
  const container = document.querySelector('.mobile-layout')
  if (container) container.scrollTop = scrollTop.value
})

onMounted(() => {
  // 加载职位列表、通知公告和AI推荐
  // onLoad()
  loadNotices()
  loadRecommendations()
})

// 加载AI推荐
const loadRecommendations = async () => {
  try {
    const res = await getAIRecommendJobs(5)
    recommendedJobs.value = res.data || []
  } catch (error) {
    console.error('加载AI推荐失败', error)
    // 如果失败，不影响页面其他功能
  } finally {
    aiLoading.value = false
  }
}

// 获取匹配度标签类型
const getMatchType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 70) return 'warning'
  return 'default'
}

// 跳转职位详情
const toJobDetail = (jobId: string) => {
  router.push(`/student/job/${jobId}`)
}

// 跳转简历
const toResume = () => {
  router.push('/student/resume')
}

// 加载通知公告
const loadNotices = async () => {
  try {
    const res = await getHomeNotices()
    notices.value = res.data || []
  } catch (error) {
    console.error('加载通知失败', error)
  }
}

// 获取通知类型标签颜色
const getNoticeTagType = (type: string) => {
  const map: Record<string, string> = {
    '1': 'primary',    // 通知
    '2': 'success',    // 公告
    '3': 'warning',    // 政策
    '4': 'default'     // 新闻
  }
  return map[type] || 'default'
}

// 跳转通知列表
const toNoticeList = () => {
  router.push('/student/notices')
}

// 跳转通知详情
const toNoticeDetail = (noticeId: string) => {
  router.push(`/student/notice/${noticeId}`)
}

const onLoad = async () => {
  try {
    // 首页只加载第一页的推荐职位，keyword可以传空格或特定的推荐词
    const res = await searchApi({
      pageNum: pageNum.value,
      pageSize: 10,
      keyword: '', // 后端如果不允许空串，这里传个空格
      type: 'JOB'
    })

    // 如果返回的是 Result<PageResult<Vo>>，数据在 res.data.data
    const list = res.data?.data || []
    jobList.value.push(...list)

    // 首页演示只加载一页即可，模拟“更多”去搜索页
    finished.value = true
  } catch (e) {
    finished.value = true
  } finally {
    loading.value = false
  }
}

const toSearchPage = () => {
  router.push('/student/jobs')
}

const toDetail = (item: SearchResultVo) => {
  console.log('Go to detail:', item.id)
  // router.push(`/student/job/${item.id}`)
  router.push(`/student/job/${item.id}`)
}
</script>

<style scoped>
:deep(.van-search) {
  padding: 0;
  background: transparent;
}
:deep(.van-search__content) {
  background-color: #f3f4f6;
}
</style>