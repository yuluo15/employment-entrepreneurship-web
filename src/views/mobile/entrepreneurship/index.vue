<template>
  <div class="mobile-entrep min-h-screen bg-[#f7f8fa]">
    <div class="sticky top-0 z-50 bg-white shadow-sm px-2 py-2">
      <van-search
          v-model="keyword"
          shape="round"
          show-action
          placeholder="搜索创业项目..."
          @search="onSearch"
      >
        <template #action>
          <div @click="onSearch">搜索</div>
        </template>
      </van-search>
    </div>

    <div class="p-3 pb-32">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多项目了"
            @load="onLoad"
            :immediate-check="false"
        >
          <template v-if="list.length > 0">
            <div
                v-for="item in list"
                :key="item.id"
                class="bg-white p-4 rounded-lg shadow-sm mb-3 active:bg-gray-50 transition-colors"
                @click="toProjectDetail(item.id)"
            >
              <div class="flex items-start gap-3">
                <van-image
                    width="48px"
                    height="48px"
                    radius="4px"
                    :src="item.avatar"
                    class="bg-gray-50 border border-gray-100 shrink-0"
                />

                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start mb-1">
                    <span class="font-bold text-base text-gray-800 line-clamp-1">{{ item.title }}</span>
                    <span v-if="item.highlight" class="text-sm font-bold shrink-0 ml-2 text-purple-600">
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
                        text-color="#7c3aed"
                        class="px-1.5 py-0.5"
                    >
                      {{ tag }}
                    </van-tag>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <van-empty v-else-if="!loading" description="暂无项目数据" />
        </van-list>
      </van-pull-refresh>
    </div>

    <div class="fixed bottom-20 right-4 z-50">
      <van-button
          round
          icon="plus"
          class="shadow-lg !h-12 !px-5 font-bold border-none text-white"
          color="linear-gradient(to right, #8b5cf6, #7c3aed)"
          to="/student/my/project/edit"
      >
        发布项目
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { searchApi, type SearchResultVo } from '@/api/mobile/job'

defineOptions({ name: 'StudentEntrep' })

const router = useRouter()
const keyword = ref('')
const list = ref<SearchResultVo[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const pageNum = ref(1)
const scrollTop = ref(0)

// --- 滚动保持 ---
onBeforeRouteLeave((to, from, next) => {
  const container = document.querySelector('.mobile-layout')
  if (container) {
    scrollTop.value = container.scrollTop
  }
  next()
})

onActivated(() => {
  const container = document.querySelector('.mobile-layout')
  if (container) {
    container.scrollTop = scrollTop.value
  }
})

// --- 核心修复逻辑 ---
onMounted(() => {
  // 必须手动调用一次！
  // 因为我们设置了 immediate-check="false"，van-list 自己不会动了
  // 这保证了 Tab 点击进来一定有数据
  if (list.value.length === 0) {
    onLoad()
  }
})

const onLoad = async () => {
  if (refreshing.value) {
    list.value = []
    refreshing.value = false
  }

  // 防重锁：虽然 van-list 也会控制，但自己加一层最保险
  if (loading.value) return
  loading.value = true

  try {
    const res = await searchApi({
      pageNum: pageNum.value,
      pageSize: 10,
      keyword: keyword.value || '',
      type: 'PROJECT'
    })

    const data = res.data?.data || []

    if (data.length === 0) {
      finished.value = true
    } else {
      list.value.push(...data)
      pageNum.value++
      if (data.length < 10) {
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
  list.value = []
  loading.value = true
  onLoad()
}

const onRefresh = () => {
  finished.value = false
  pageNum.value = 1
  // 这里必须设为 true，否则 onLoad 里的防重锁会拦住
  loading.value = false
  onLoad()
}

const toProjectDetail = (id: string) => {
  router.push(`/student/project/${id}`)
}
</script>

<style scoped>
:deep(.van-search) {
  padding: 0;
}
</style>