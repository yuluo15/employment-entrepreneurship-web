<template>
  <div class="teacher-guidance min-h-screen bg-[#f7f8fa]">
    <!-- 顶部统计 -->
    <div class="bg-white px-4 py-4 mb-2">
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">{{ stats.totalCount }}</div>
          <div class="text-xs text-gray-500 mt-1">总指导次数</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ stats.projectCount }}</div>
          <div class="text-xs text-gray-500 mt-1">指导项目数</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ stats.monthCount }}</div>
          <div class="text-xs text-gray-500 mt-1">本月指导</div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white px-3 py-2 mb-2">
      <van-search
        v-model="keyword"
        shape="round"
        placeholder="搜索项目名称..."
        @search="onSearch"
      />
    </div>

    <!-- 指导记录列表 -->
    <div class="px-3 pb-20">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多记录了"
          @load="onLoad"
          :immediate-check="false"
        >
          <template v-if="list.length > 0">
            <div
              v-for="item in list"
              :key="item.id"
              class="bg-white rounded-lg shadow-sm mb-3 overflow-hidden"
            >
              <!-- 项目信息 -->
              <div
                class="p-4 border-b border-gray-100 active:bg-gray-50"
                @click="toProjectDetail(item.projectId)"
              >
                <div class="flex items-start gap-3">
                  <van-image
                    width="40px"
                    height="40px"
                    radius="6px"
                    :src="item.projectLogo"
                    class="bg-gray-50 shrink-0"
                  >
                    <template #default>
                      <div class="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                        <van-icon name="bulb-o" size="20" color="#8b5cf6" />
                      </div>
                    </template>
                  </van-image>
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-sm text-gray-800 mb-1">{{ item.projectName }}</div>
                    <div class="text-xs text-gray-500">
                      {{ item.studentName }} · {{ item.domain }}
                    </div>
                  </div>
                  <van-icon name="arrow" color="#c8c9cc" />
                </div>
              </div>

              <!-- 指导内容 -->
              <div class="p-4 bg-gray-50">
                <div class="flex items-start gap-2 mb-2">
                  <van-image
                    round
                    width="24px"
                    height="24px"
                    :src="item.teacherAvatar"
                    class="shrink-0"
                  >
                    <template #default>
                      <div class="w-full h-full bg-purple-100 flex items-center justify-center">
                        <van-icon name="user-o" size="12" color="#8b5cf6" />
                      </div>
                    </template>
                  </van-image>
                  <div class="flex-1 min-w-0">
                    <div class="text-xs text-gray-500 mb-1">{{ item.teacherName }} · {{ item.createTime }}</div>
                    <div class="text-sm text-gray-700 leading-relaxed">{{ item.content }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <van-empty v-else-if="!loading" description="暂无指导记录" />
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { showToast } from 'vant'
import { getGuidanceList, getGuidanceStats } from '@/api/teacher'

defineOptions({ name: 'TeacherGuidance' })

const router = useRouter()

// 统计数据
const stats = ref({
  totalCount: 0,
  projectCount: 0,
  monthCount: 0
})

// 搜索
const keyword = ref('')

// 列表数据
const list = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const pageNum = ref(1)
const scrollTop = ref(0)

// 滚动保持
onBeforeRouteLeave((to, from, next) => {
  const container = document.querySelector('.teacher-layout')
  if (container) {
    scrollTop.value = container.scrollTop
  }
  next()
})

onActivated(() => {
  const container = document.querySelector('.teacher-layout')
  if (container) {
    container.scrollTop = scrollTop.value
  }
})

onMounted(() => {
  loadStats()
  if (list.value.length === 0) {
    onLoad()
  }
})

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await getGuidanceStats()
    stats.value = res.data
  } catch (error) {
    console.error('加载统计失败', error)
    showToast('加载统计失败')
  }
}

// 加载列表数据
const onLoad = async () => {
  if (refreshing.value) {
    list.value = []
    refreshing.value = false
  }

  if (loading.value) return
  loading.value = true

  try {
    const res = await getGuidanceList({
      pageNum: pageNum.value,
      pageSize: 10,
      keyword: keyword.value
    })
    
    const data = res.data
    const records = data.data || [] // 后端返回的是 data.data 不是 data.list

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

// 搜索
const onSearch = () => {
  pageNum.value = 1
  finished.value = false
  list.value = []
  loading.value = true
  onLoad()
}

// 下拉刷新
const onRefresh = () => {
  finished.value = false
  pageNum.value = 1
  loading.value = false
  loadStats()
  onLoad()
}

// 跳转项目详情
const toProjectDetail = (projectId: string) => {
  router.push(`/teacher/project/${projectId}`)
}
</script>

<style scoped>
:deep(.van-search) {
  padding: 0;
}
</style>
