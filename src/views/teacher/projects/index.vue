<template>
  <div class="teacher-projects min-h-screen bg-[#f7f8fa]">
    <!-- 顶部搜索和筛选 -->
    <div class="sticky top-0 z-50 bg-white shadow-sm">
      <van-search
        v-model="keyword"
        shape="round"
        show-action
        placeholder="搜索项目名称、学生姓名..."
        @search="onSearch"
        class="px-2 py-2"
      >
        <template #action>
          <div @click="onSearch">搜索</div>
        </template>
      </van-search>

      <!-- Tab切换：我的项目 / 本校项目 / 全网项目 -->
      <van-tabs v-model:active="activeTab" @change="onTabChange" sticky offset-top="0">
        <van-tab title="我的项目" name="my" />
        <van-tab title="本校项目" name="school" />
        <van-tab title="全网项目" name="all" />
      </van-tabs>

      <!-- 筛选栏 -->
      <div class="flex items-center px-3 py-2 bg-gray-50 border-t border-gray-100">
        <van-dropdown-menu>
          <van-dropdown-item v-model="filters.status" :options="statusOptions" @change="onFilterChange" />
          <van-dropdown-item v-model="filters.domain" :options="domainOptions" @change="onFilterChange" />
        </van-dropdown-menu>
      </div>
    </div>

    <!-- 项目列表 -->
    <div class="p-3 pb-20">
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
              :key="item.projectId"
              class="bg-white p-4 rounded-lg shadow-sm mb-3 active:bg-gray-50 transition-colors"
              @click="toProjectDetail(item.projectId)"
            >
              <div class="flex items-start gap-3">
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
                  <div class="flex justify-between items-start mb-1">
                    <span class="font-bold text-base text-gray-800 line-clamp-1 flex-1">
                      {{ item.projectName }}
                    </span>
                    <van-tag
                      :type="getStatusTagType(item.status)"
                      size="small"
                      class="ml-2 shrink-0"
                    >
                      {{ getStatusLabel(item.status) }}
                    </van-tag>
                  </div>

                  <div class="text-xs text-gray-500 mb-2">
                    <span>{{ item.studentName }}</span>
                    <span class="mx-1">·</span>
                    <span>{{ item.schoolName }}</span>
                    <span class="mx-1" v-if="item.collegeName">·</span>
                    <span v-if="item.collegeName">{{ item.collegeName }}</span>
                  </div>

                  <div class="flex flex-wrap gap-2 mb-2">
                    <van-tag
                      color="#f3f4f6"
                      text-color="#7c3aed"
                      size="small"
                    >
                      {{ item.domain }}
                    </van-tag>
                    <van-tag
                      color="#f3f4f6"
                      text-color="#6b7280"
                      size="small"
                    >
                      团队{{ item.teamSize }}人
                    </van-tag>
                  </div>

                  <div class="flex items-center justify-between text-xs text-gray-400">
                    <span>{{ item.createTime }}</span>
                    <div class="flex items-center gap-3">
                      <span v-if="item.guidanceCount > 0">
                        <van-icon name="chat-o" /> {{ item.guidanceCount }}条指导
                      </span>
                      <span v-else class="text-orange-500">待指导</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <van-empty v-else-if="!loading" description="暂无项目数据" />
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { showToast } from 'vant'
import { getTeacherProjects, getProjectDomains } from '@/api/teacher'

defineOptions({ name: 'TeacherProjects' })

const router = useRouter()
const route = useRoute()

// Tab状态
const activeTab = ref('my') // 默认显示我的项目

// 搜索和筛选
const keyword = ref('')
const filters = ref({
  status: '',
  domain: ''
})

// 筛选选项
const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '待审核', value: '0' },
  { text: '孵化中', value: '1' },
  { text: '已驳回', value: '2' },
  { text: '已落地', value: '3' }
]

const domainOptions = ref([
  { text: '全部领域', value: '' }
])

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
  
  // 从URL参数恢复状态
  if (route.query.scope) {
    activeTab.value = route.query.scope as string
  }
  if (route.query.status) {
    filters.value.status = route.query.status as string
  }
})

onMounted(() => {
  // 加载领域选项
  loadDomainOptions()
  
  // 从URL参数初始化
  if (route.query.scope) {
    activeTab.value = route.query.scope as string
  }
  if (route.query.status) {
    filters.value.status = route.query.status as string
  }
  
  if (list.value.length === 0) {
    onLoad()
  }
})

// 加载领域选项
const loadDomainOptions = async () => {
  try {
    const res = await getProjectDomains()
    const domains = res.data || []
    
    // 构建选项列表，使用 dictValue 作为 value，dictLabel 作为 text
    domainOptions.value = [
      { text: '全部领域', value: '' },
      ...domains.map((item: any) => ({
        text: item.dictLabel,
        value: item.dictValue
      }))
    ]
  } catch (error) {
    console.error('加载领域选项失败', error)
  }
}

// 加载数据
const onLoad = async () => {
  if (refreshing.value) {
    list.value = []
    refreshing.value = false
  }

  if (loading.value) return
  loading.value = true

  try {
    const res = await getTeacherProjects({
      pageNum: pageNum.value,
      pageSize: 10,
      keyword: keyword.value,
      scope: activeTab.value,
      status: filters.value.status,
      domain: filters.value.domain
    })
    
    const data = res.data
    // 后端返回的列表字段是 data，不是 list
    const projectList = data.data || data.list || []

    if (projectList.length === 0) {
      finished.value = true
    } else {
      list.value.push(...projectList)
      pageNum.value++
      if (projectList.length < 10) {
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
  resetList()
}

// 筛选变化
const onFilterChange = () => {
  resetList()
}

// 搜索
const onSearch = () => {
  resetList()
}

// 下拉刷新
const onRefresh = () => {
  finished.value = false
  pageNum.value = 1
  loading.value = false
  onLoad()
}

// 重置列表
const resetList = () => {
  pageNum.value = 1
  finished.value = false
  list.value = []
  loading.value = false
  onLoad()
}

// 跳转项目详情
const toProjectDetail = (projectId: string) => {
  router.push(`/teacher/project/${projectId}`)
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    '0': 'warning',
    '1': 'success',
    '2': 'danger',
    '3': 'primary'
  }
  return map[status] || 'default'
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    '0': '待审核',
    '1': '孵化中',
    '2': '已驳回',
    '3': '已落地'
  }
  return map[status] || '未知'
}
</script>

<style scoped>
:deep(.van-search) {
  padding: 0;
}

:deep(.van-dropdown-menu__bar) {
  box-shadow: none;
  background: transparent;
}
</style>
