<template>
  <div class="app-container">
    <!-- 欢迎卡片 -->
    <el-card shadow="never" class="mb-4 welcome-card">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <el-avatar :size="64" :src="companyInfo.logo" class="mr-4">
            <el-icon :size="32"><OfficeBuilding /></el-icon>
          </el-avatar>
          <div>
            <h2 class="text-xl font-bold text-white">{{ companyInfo.name || '企业工作台' }}</h2>
            <p class="text-white opacity-80 mt-2 text-sm">
              欢迎回来，{{ hrInfo.name || 'HR' }} · {{ getCurrentTime() }}
            </p>
          </div>
        </div>
      </div>
    </el-card>

    <!-- KPI卡片 -->
    <el-row :gutter="20" class="mb-4" v-loading="loading">
      <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in statCards" :key="index">
        <el-card shadow="hover" class="stat-card mb-4" :body-style="{ padding: '20px' }">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-sm text-gray-500 mb-2">{{ item.title }}</div>
              <div class="text-3xl font-bold text-gray-800 font-mono">{{ item.value }}</div>
              <div class="text-xs text-gray-400 mt-2">{{ item.subTitle }}</div>
            </div>
            <div class="icon-bg" :style="{ background: item.bgColor }">
              <el-icon :size="24" :color="item.iconColor"><component :is="item.icon" /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="mb-4">
      <!-- 简历投递趋势 -->
      <el-col :xs="24" :lg="14" class="mb-4">
        <el-card shadow="never" class="h-full" v-loading="loading">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">近7天简历投递趋势</span>
              <el-button text type="primary" @click="router.push('/company/recruitment/pending')">
                查看全部
              </el-button>
            </div>
          </template>
          <div ref="trendChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 职位投递排行 -->
      <el-col :xs="24" :lg="10" class="mb-4">
        <el-card shadow="never" class="h-full" v-loading="loading">
          <template #header>
            <span class="font-bold">职位投递排行 TOP5</span>
          </template>
          <div ref="rankChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办事项和快捷入口 -->
    <el-row :gutter="20" class="mb-4">
      <!-- 待处理简历 -->
      <el-col :xs="24" :lg="12" class="mb-4">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">待处理简历</span>
              <el-badge :value="pendingResumes.length" type="danger" v-if="pendingResumes.length > 0" />
            </div>
          </template>
          <div class="todo-list">
            <div v-for="resume in pendingResumes" :key="resume.id" class="todo-item">
              <div class="flex items-start flex-1">
                <el-avatar :size="40" :src="resume.studentAvatar" class="mr-3">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-800">{{ resume.studentName }}</div>
                  <div class="text-xs text-gray-400 mt-1">
                    投递：{{ resume.jobName }} · {{ resume.createTime }}
                  </div>
                </div>
              </div>
              <el-button link type="primary" size="small" @click="handleViewResume(resume)">
                查看
              </el-button>
            </div>
            <div v-if="pendingResumes.length === 0" class="text-center text-gray-400 py-10">
              暂无待处理简历
            </div>
          </div>
          <div class="text-center mt-4 pt-4 border-t border-gray-100">
            <el-button link type="primary" @click="router.push('/company/recruitment/pending')">
              查看全部简历
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 今日面试安排 -->
      <el-col :xs="24" :lg="12" class="mb-4">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">今日面试安排</span>
              <el-badge :value="todayInterviews.length" type="success" v-if="todayInterviews.length > 0" />
            </div>
          </template>
          <div class="todo-list">
            <div v-for="interview in todayInterviews" :key="interview.id" class="todo-item">
              <div class="flex items-start flex-1">
                <el-icon :size="24" class="mr-3 text-blue-500"><Clock /></el-icon>
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-800">
                    {{ interview.studentName }} - {{ interview.jobName }}
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    {{ interview.interviewTime }} · {{ getInterviewTypeLabel(interview.type) }}
                  </div>
                </div>
              </div>
              <el-button link type="primary" size="small" @click="handleViewInterview(interview)">
                详情
              </el-button>
            </div>
            <div v-if="todayInterviews.length === 0" class="text-center text-gray-400 py-10">
              今日暂无面试安排
            </div>
          </div>
          <div class="text-center mt-4 pt-4 border-t border-gray-100">
            <el-button link type="primary" @click="router.push('/company/recruitment/interview')">
              查看全部面试
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-card shadow="never">
      <template #header>
        <span class="font-bold">快捷入口</span>
      </template>
      <el-row :gutter="20">
        <el-col :xs="12" :sm="6" v-for="(item, index) in shortcuts" :key="index">
          <div class="shortcut-item" @click="router.push(item.path)">
            <div class="icon-wrapper" :style="{ background: item.bgColor }">
              <el-icon :size="32" :color="item.iconColor"><component :is="item.icon" /></el-icon>
            </div>
            <div class="text-sm font-medium text-gray-700 mt-3">{{ item.title }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  OfficeBuilding, User, Clock, DocumentAdd, Document, Calendar, Setting
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getCompanyDashboard } from '@/api/company'

const router = useRouter()
const loading = ref(false)

// 企业信息
const companyInfo = reactive({
  name: '',
  logo: ''
})

// HR信息
const hrInfo = reactive({
  name: ''
})

// KPI数据
const statCards = ref([
  {
    title: '在招职位',
    value: 0,
    subTitle: '正在招聘中',
    icon: DocumentAdd,
    bgColor: '#ecf5ff',
    iconColor: '#409eff'
  },
  {
    title: '待处理简历',
    value: 0,
    subTitle: '等待处理',
    icon: Document,
    bgColor: '#fdf6ec',
    iconColor: '#e6a23c'
  },
  {
    title: '今日面试',
    value: 0,
    subTitle: '今天安排',
    icon: Calendar,
    bgColor: '#f0f9eb',
    iconColor: '#67c23a'
  },
  {
    title: '本月简历',
    value: 0,
    subTitle: '本月收到',
    icon: User,
    bgColor: '#f4f4f5',
    iconColor: '#909399'
  }
])

// 待处理简历
const pendingResumes = ref<any[]>([])

// 今日面试
const todayInterviews = ref<any[]>([])

// 简历趋势数据
const trendData = ref<any>({
  dates: [],
  counts: []
})

// 职位排行数据
const rankData = ref<any[]>([])

// 快捷入口
const shortcuts = [
  {
    title: '发布职位',
    icon: DocumentAdd,
    path: '/company/position/post',
    bgColor: '#ecf5ff',
    iconColor: '#409eff'
  },
  {
    title: '职位管理',
    icon: Document,
    path: '/company/position/manage',
    bgColor: '#fdf6ec',
    iconColor: '#e6a23c'
  },
  {
    title: '简历管理',
    icon: User,
    path: '/company/recruitment/pending',
    bgColor: '#f0f9eb',
    iconColor: '#67c23a'
  },
  {
    title: '企业信息',
    icon: Setting,
    path: '/company/profile',
    bgColor: '#f4f4f5',
    iconColor: '#909399'
  }
]

// 图表引用
const trendChartRef = ref()
const rankChartRef = ref()
let trendChart: any = null
let rankChart: any = null

// 获取当前时间
const getCurrentTime = () => {
  return dayjs().format('YYYY年MM月DD日 dddd')
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getCompanyDashboard()
    const data = res.data

    // 更新企业和HR信息
    companyInfo.name = data.companyName
    companyInfo.logo = data.companyLogo
    hrInfo.name = data.hrName

    // 更新KPI数据
    statCards.value[0].value = data.activeJobCount
    statCards.value[1].value = data.pendingResumeCount
    statCards.value[2].value = data.todayInterviewCount
    statCards.value[3].value = data.monthResumeCount

    // 更新待处理简历
    pendingResumes.value = data.pendingResumes || []

    // 更新今日面试
    todayInterviews.value = data.todayInterviews || []

    // 更新趋势数据
    trendData.value = data.resumeTrend || { dates: [], counts: [] }

    // 更新排行数据
    rankData.value = data.jobRank || []

    // 渲染图表
    initCharts()
  } catch (error) {
    console.error('加载数据失败', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  // 销毁旧图表
  trendChart?.dispose()
  rankChart?.dispose()

  // 1. 简历投递趋势
  if (trendChartRef.value && trendData.value.dates.length > 0) {
    trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: trendData.value.dates,
        boundaryGap: false
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '简历数',
          type: 'line',
          smooth: true,
          data: trendData.value.counts,
          itemStyle: { color: '#409eff' },
          areaStyle: { opacity: 0.3, color: '#409eff' }
        }
      ]
    })
  }

  // 2. 职位投递排行
  if (rankChartRef.value && rankData.value.length > 0) {
    rankChart = echarts.init(rankChartRef.value)
    rankChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value' },
      yAxis: {
        type: 'category',
        data: rankData.value.map(item => item.jobName),
        inverse: true
      },
      series: [
        {
          name: '投递数',
          type: 'bar',
          data: rankData.value.map(item => item.count),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#67c23a' },
              { offset: 1, color: '#95d475' }
            ]),
            borderRadius: [0, 4, 4, 0]
          },
          label: { show: true, position: 'right' }
        }
      ]
    })
  }
}

// 查看简历
const handleViewResume = (resume: any) => {
  router.push({
    path: '/company/recruitment/pending',
    query: { deliveryId: resume.id }
  })
}

// 查看面试
const handleViewInterview = (interview: any) => {
  router.push({
    path: '/company/recruitment/interview',
    query: { interviewId: interview.id }
  })
}

// 获取面试类型标签
const getInterviewTypeLabel = (type: number) => {
  const map: Record<number, string> = {
    1: '线下面试',
    2: '视频面试',
    3: '电话面试'
  }
  return map[type] || '未知'
}

// 窗口大小改变时重绘图表
const handleResize = () => {
  trendChart?.resize()
  rankChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  rankChart?.dispose()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;

  :deep(.el-card__body) { color: white; }
}

.stat-card {
  border: none;
  transition: all 0.3s;
  cursor: pointer;
  &:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

  .icon-bg {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.todo-list {
  .todo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f2f5;
    &:last-child { border-bottom: none; }
  }
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
  border: 1px solid #e4e7ed;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .icon-wrapper {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
