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
      <div class="px-2 text-center" @click="$router.push('/student/message')">
        <van-icon name="chat-o" size="24" color="#666" badge="9" />
        <div class="text-[10px] text-gray-500 scale-90">消息</div>
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

    <div class="mt-3 bg-white mx-3 rounded-lg p-2 shadow-sm">
      <div class="text-sm font-bold px-2 mb-1 text-gray-800 flex items-center">
        <van-icon name="fire" color="#ee0a24" class="mr-1" /> 创业直通车
      </div>
      <van-grid :border="false" :column-num="4">
        <van-grid-item icon="manager-o" text="找导师" to="/student/entrepreneurship?tab=mentor" />
        <van-grid-item icon="gold-coin-o" text="找资金" to="/student/entrepreneurship?tab=fund" />
        <van-grid-item icon="shop-o" text="创客空间" to="/student/entrepreneurship?tab=space" />
        <van-grid-item icon="newspaper-o" text="政策扶持" to="/student/entrepreneurship?tab=policy" />
      </van-grid>
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

          <div class="flex items-center text-xs text-gray-500 mb-2">
            <span>{{ item.subTitle.split('|')[0] }}</span> <span class="mx-1.5 h-3 w-[1px] bg-gray-300" v-if="item.subTitle.includes('|')"></span>
            <span v-if="item.subTitle.includes('|')">{{ item.subTitle.split('|')[1] }}</span> <span class="mx-1.5 h-3 w-[1px] bg-gray-300"></span>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { searchApi, type SearchResultVo } from '@/api/mobile/job'
defineOptions({ name: 'StudentHome' })

const router = useRouter()
const dummySearch = ref('')
const banners = [
  { title: '2026届秋季校园双选会', color: '#3b82f6', url: '' },
  { title: '大学生创业创新大赛报名', color: '#8b5cf6', url: '' },
  { title: '简历门诊：资深HR在线修改', color: '#f59e0b', url: '' }
]

const loading = ref(false)
const finished = ref(false)
const jobList = ref<SearchResultVo[]>([])
const pageNum = ref(1)
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
  // 如果这里不调用，第一次进来列表是空的
  onLoad()
})

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