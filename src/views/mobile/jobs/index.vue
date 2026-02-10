<template>
  <div class="mobile-jobs">
    <div class="sticky top-0 z-50 bg-white shadow-sm">
      <div class="flex items-center px-2 py-2">
        <van-icon name="arrow-left" class="mr-2 px-2" @click="$router.back()" />
        <van-search
            v-model="keyword"
            shape="round"
            show-action
            placeholder="请输入关键词"
            class="flex-1"
            @search="onSearch"
        >
          <template #action>
            <div @click="onSearch">搜索</div>
          </template>
        </van-search>
      </div>

      <van-tabs v-model:active="activeType" @change="onTabChange" color="#3b82f6">
        <van-tab title="职位" name="JOB" />
        <van-tab title="公司" name="COMPANY" />
<!--        <van-tab title="项目" name="PROJECT" />-->
      </van-tabs>
    </div>

    <div class="p-3 pb-20">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多数据了"
            @load="onLoad"
        >
          <template v-if="list.length > 0">
            <div
                v-for="item in list"
                :key="item.id"
                class="bg-white p-4 rounded-lg shadow-sm mb-3 active:bg-gray-50 transition-colors"
                @click="toDetail(item)"
            >
              <div class="flex items-start gap-3">
                <van-image
                    v-if="item.type !== 'JOB'"
                    width="48px"
                    height="48px"
                    radius="4px"
                    :src="item.avatar"
                    class="bg-gray-50 border border-gray-100 shrink-0"
                />

                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start mb-1">
                    <span class="font-bold text-base text-gray-800 line-clamp-1">{{ item.title }}</span>
                    <span
                        v-if="item.highlight"
                        class="text-sm font-bold shrink-0 ml-2"
                        :class="item.type === 'JOB' ? 'text-blue-600' : 'text-orange-500'"
                    >
                      {{ item.highlight }}
                    </span>
                  </div>

                  <div class="text-xs text-gray-500 mb-2 truncate">
                    {{ item.subTitle }} <span v-if="item.location">· {{ item.location }}</span>
                  </div>

                  <div class="flex flex-wrap gap-2">
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
                </div>
              </div>

              <div v-if="item.type === 'JOB'" class="mt-3 pt-2 border-t border-gray-100 flex items-center">
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
          </template>

          <van-empty v-else-if="!loading" description="暂无相关数据" />
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { searchApi, type SearchResultVo } from '@/api/mobile/job'
import { useRouter } from 'vue-router'

defineOptions({ name: 'StudentJobs' })

const router = useRouter()
const keyword = ref('')
const activeType = ref<'JOB' | 'COMPANY'>('JOB')
const list = ref<SearchResultVo[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const pageNum = ref(1)
const scrollTop = ref(0)

// 离开页面前：记录当前滚动条位置
onBeforeRouteLeave((to, from, next) => {
  const container = document.querySelector('.mobile-layout')
  if (container) {
    scrollTop.value = container.scrollTop
  }
  next()
})

// 回到页面时 (KeepAlive 特有生命周期)：恢复滚动条位置
onActivated(() => {
  const container = document.querySelector('.mobile-layout')
  if (container) {
    container.scrollTop = scrollTop.value
  }
})

onMounted(() => {
  // 【修复】确保进入页面时触发加载
  // 加上 finished 判断防止重复
  if (!finished.value && list.value.length === 0) {
    onLoad()
  }
})

const onLoad = async () => {
  if (refreshing.value) {
    list.value = []
    refreshing.value = false
  }

  try {
    const res = await searchApi({
      pageNum: pageNum.value,
      pageSize: 5,
      keyword: keyword.value || '', // 默认搜索全部
      type: activeType.value
    })

    const data = res.data?.data || [] // 注意这里 res.data 是 PageResult

    if (data.length === 0) {
      finished.value = true
    } else {
      list.value.push(...data)
      pageNum.value++
      // 如果返回的数据少于 pageSize，说明到底了
      if (data.length < 5) {
        finished.value = true
      }
    }
  } catch (error) {
    finished.value = true
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  pageNum.value = 1
  finished.value = false
  list.value = [] // 清空列表触发重新加载
  loading.value = true // 设置loading防止重复触发
  onLoad()
}

const onRefresh = () => {
  finished.value = false
  pageNum.value = 1
  loading.value = true
  onLoad()
}

const onTabChange = () => {
  onSearch()
}

const toDetail = (item: SearchResultVo) => {
  if (item.type === 'JOB') {
    router.push(`/student/job/${item.id}`)
  } else if (item.type === 'COMPANY') {
    router.push(`/student/company/${item.id}`)
  } else if (item.type === 'PROJECT') {
    router.push(`/student/project/${item.id}`)
  }
}
</script>

<style scoped>
:deep(.van-search) {
  padding: 0;
}
</style>