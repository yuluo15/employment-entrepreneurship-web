<template>
  <div class="app-container">
    <!-- 欢迎卡片 -->
    <el-card shadow="never" class="mb-4 welcome-card">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="avatar-box mr-4">
            <el-icon :size="32" color="white"><School /></el-icon>
          </div>
          <div>
            <h2 class="text-xl font-bold text-white">{{ schoolInfo.name || '学校工作台' }}</h2>
            <p class="text-white opacity-90 mt-2 text-sm">
              <span class="mr-4">{{ currentDate }}</span>
              <el-tag effect="dark" type="success">学校管理员</el-tag>
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
      <!-- 就业率趋势 -->
      <el-col :xs="24" :lg="14" class="mb-4">
        <el-card shadow="never" class="h-full" v-loading="loading">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">近6个月就业率趋势</span>
              <el-button text type="primary" @click="router.push('/school/statistics/employment')">
                查看详情
              </el-button>
            </div>
          </template>
          <div ref="employmentTrendRef" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 创业项目状态分布 -->
      <el-col :xs="24" :lg="10" class="mb-4">
        <el-card shadow="never" class="h-full" v-loading="loading">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">创业项目状态分布</span>
              <el-button text type="primary" @click="router.push('/school/statistics/entrepreneurship')">
                查看详情
              </el-button>
            </div>
          </template>
          <div ref="projectStatusRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办事项和快捷入口 -->
    <el-row :gutter="20" class="mb-4">
      <!-- 待审核项目 -->
      <el-col :xs="24" :lg="12" class="mb-4">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">待审核创业项目</span>
              <el-badge :value="pendingProjects.length" type="danger" v-if="pendingProjects.length > 0" />
            </div>
          </template>
          <div class="todo-list">
            <div v-for="project in pendingProjects" :key="project.projectId" class="todo-item">
              <div class="flex items-start flex-1">
                <el-avatar :size="40" :src="project.logo" class="mr-3">
                  <el-icon><Briefcase /></el-icon>
                </el-avatar>
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-800">{{ project.projectName }}</div>
                  <div class="text-xs text-gray-400 mt-1">
                    {{ project.studentName }} · {{ project.domain }} · {{ project.createTime }}
                  </div>
                </div>
              </div>
              <el-button link type="primary" size="small" @click="handleViewProject(project)">
                审核
              </el-button>
            </div>
            <div v-if="pendingProjects.length === 0" class="text-center text-gray-400 py-10">
              <el-icon :size="48" class="mb-2"><CircleCheck /></el-icon>
              <div>暂无待审核项目</div>
            </div>
          </div>
          <div class="text-center mt-4 pt-4 border-t border-gray-100" v-if="pendingProjects.length > 0">
            <el-button link type="primary" @click="router.push('/school/project/list')">
              查看全部项目
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 最新通知公告 -->
      <el-col :xs="24" :lg="12" class="mb-4">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">最新通知公告</span>
            </div>
          </template>
          <div class="todo-list">
            <div v-for="notice in latestNotices" :key="notice.noticeId" class="todo-item">
              <div class="flex items-start flex-1">
                <el-tag 
                  :type="getNoticeTypeTag(notice.noticeType)" 
                  size="small" 
                  class="mr-3 mt-0.5"
                >
                  {{ getNoticeTypeLabel(notice.noticeType) }}
                </el-tag>
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-800">
                    <el-tag v-if="notice.isTop === 1" type="danger" size="small" class="mr-1">置顶</el-tag>
                    {{ notice.noticeTitle }}
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    {{ notice.publishTime }}
                  </div>
                </div>
              </div>
              <el-button link type="primary" size="small" @click="handleViewNotice(notice)">
                查看
              </el-button>
            </div>
            <div v-if="latestNotices.length === 0" class="text-center text-gray-400 py-10">
              暂无通知公告
            </div>
          </div>
          <div class="text-center mt-4 pt-4 border-t border-gray-100" v-if="latestNotices.length > 0">
            <el-button link type="primary" @click="router.push('/school/notice')">
              查看全部通知
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 各学院数据概览 -->
<!--    <el-row :gutter="20" class="mb-4">-->
<!--      <el-col :span="24">-->
<!--        <el-card shadow="never" v-loading="loading">-->
<!--          <template #header>-->
<!--            <div class="flex justify-between items-center">-->
<!--              <span class="font-bold">各学院就业情况</span>-->
<!--              <el-button text type="primary" @click="router.push('/school/statistics/employment')">-->
<!--                查看详情-->
<!--              </el-button>-->
<!--            </div>-->
<!--          </template>-->
<!--          <div ref="collegeChartRef" style="height: 300px;"></div>-->
<!--        </el-card>-->
<!--      </el-col>-->
<!--    </el-row>-->

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
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  School, User, Briefcase, TrendCharts, Document, DataAnalysis, 
  UserFilled, CircleCheck, Notification
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getSchoolDashboard } from '@/api/school'

const router = useRouter()
const currentDate = computed(() => dayjs().format('YYYY年MM月DD日 dddd'))
const loading = ref(false)

// 学校信息
const schoolInfo = reactive({
  name: ''
})

// KPI数据
const statCards = ref([
  {
    title: '学生总数',
    value: 0,
    subTitle: '在校学生',
    icon: User,
    bgColor: '#ecf5ff',
    iconColor: '#409eff'
  },
  {
    title: '教师总数',
    value: 0,
    subTitle: '指导教师',
    icon: UserFilled,
    bgColor: '#fdf6ec',
    iconColor: '#e6a23c'
  },
  {
    title: '就业率',
    value: '0%',
    subTitle: '本届毕业生',
    icon: TrendCharts,
    bgColor: '#f0f9eb',
    iconColor: '#67c23a'
  },
  {
    title: '创业项目',
    value: 0,
    subTitle: '孵化中项目',
    icon: Briefcase,
    bgColor: '#fef0f0',
    iconColor: '#f56c6c'
  }
])

// 待审核项目
const pendingProjects = ref<any[]>([])

// 最新通知
const latestNotices = ref<any[]>([])

// 就业率趋势数据
const employmentTrend = ref<any>({
  months: [],
  rates: []
})

// 项目状态分布
const projectStatus = ref<any[]>([])

// 各学院就业情况
const collegeData = ref<any[]>([])

// 快捷入口
const shortcuts = [
  {
    title: '学生档案',
    icon: User,
    path: '/school/student/list',
    bgColor: '#ecf5ff',
    iconColor: '#409eff'
  },
  {
    title: '就业情况',
    icon: TrendCharts,
    path: '/school/student/employment',
    bgColor: '#f0f9eb',
    iconColor: '#67c23a'
  },
  {
    title: '创业项目',
    icon: Briefcase,
    path: '/school/project/list',
    bgColor: '#fef0f0',
    iconColor: '#f56c6c'
  },
  {
    title: '教师档案',
    icon: UserFilled,
    path: '/school/teacher/list',
    bgColor: '#fdf6ec',
    iconColor: '#e6a23c'
  },
  {
    title: '就业统计',
    icon: DataAnalysis,
    path: '/school/statistics/employment',
    bgColor: '#f4f4f5',
    iconColor: '#909399'
  },
  {
    title: '创业统计',
    icon: DataAnalysis,
    path: '/school/statistics/entrepreneurship',
    bgColor: '#f4f4f5',
    iconColor: '#909399'
  },
  {
    title: '通知公告',
    icon: Notification,
    path: '/school/notice',
    bgColor: '#fdf6ec',
    iconColor: '#e6a23c'
  },
  {
    title: '指导记录',
    icon: Document,
    path: '/school/teacher/guidance',
    bgColor: '#ecf5ff',
    iconColor: '#409eff'
  }
]

// 图表引用
const employmentTrendRef = ref()
const projectStatusRef = ref()
const collegeChartRef = ref()
let employmentTrendChart: any = null
let projectStatusChart: any = null
let collegeChart: any = null

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getSchoolDashboard()
    const data = res.data

    // 更新学校信息
    schoolInfo.name = data.schoolName

    // 更新KPI数据
    statCards.value[0].value = data.studentCount
    statCards.value[1].value = data.teacherCount
    statCards.value[2].value = data.employmentRate
    statCards.value[3].value = data.incubatingProjectCount

    // 更新待审核项目
    pendingProjects.value = data.pendingProjects || []

    // 更新最新通知
    latestNotices.value = data.latestNotices || []

    // 更新就业率趋势
    employmentTrend.value = data.employmentTrend || { months: [], rates: [] }

    // 更新项目状态分布
    projectStatus.value = data.projectStatus || []

    // 更新各学院数据
    collegeData.value = data.collegeStats || []

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
  employmentTrendChart?.dispose()
  projectStatusChart?.dispose()
  collegeChart?.dispose()

  // 1. 就业率趋势
  if (employmentTrendRef.value && employmentTrend.value.months.length > 0) {
    employmentTrendChart = echarts.init(employmentTrendRef.value)
    employmentTrendChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: employmentTrend.value.months,
        boundaryGap: false
      },
      yAxis: { 
        type: 'value',
        axisLabel: { formatter: '{value}%' }
      },
      series: [
        {
          name: '就业率',
          type: 'line',
          smooth: true,
          data: employmentTrend.value.rates,
          itemStyle: { color: '#67c23a' },
          areaStyle: { opacity: 0.3, color: '#67c23a' },
          label: { 
            show: true, 
            formatter: '{c}%',
            position: 'top'
          }
        }
      ]
    })
  }

  // 2. 项目状态分布
  if (projectStatusRef.value && projectStatus.value.length > 0) {
    projectStatusChart = echarts.init(projectStatusRef.value)
    projectStatusChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}个 ({d}%)' },
      legend: { bottom: '5%', left: 'center' },
      color: ['#e6a23c', '#67c23a', '#f56c6c', '#909399'],
      series: [
        {
          name: '项目状态',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{b}\n{c}个' },
          emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
          data: projectStatus.value.map(item => ({
            name: item.statusName,
            value: item.count
          }))
        }
      ]
    })
  }

  // 3. 各学院就业情况
  if (collegeChartRef.value && collegeData.value.length > 0) {
    collegeChart = echarts.init(collegeChartRef.value)
    collegeChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = params[0]
          return `${data.name}<br/>就业率: ${data.value}%`
        }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: collegeData.value.map(item => item.collegeName),
        axisLabel: { interval: 0, rotate: 30 }
      },
      yAxis: { 
        type: 'value',
        axisLabel: { formatter: '{value}%' }
      },
      series: [
        {
          name: '就业率',
          type: 'bar',
          data: collegeData.value.map(item => item.employmentRate),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#409eff' },
              { offset: 1, color: '#79bbff' }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          label: { 
            show: true, 
            position: 'top',
            formatter: '{c}%'
          }
        }
      ]
    })
  }
}

// 查看项目
const handleViewProject = (project: any) => {
  router.push({
    path: '/school/project/list',
    query: { projectId: project.projectId }
  })
}

// 查看通知
const handleViewNotice = (notice: any) => {
  router.push({
    path: '/school/notice',
    query: { noticeId: notice.noticeId }
  })
}

// 获取通知类型标签
const getNoticeTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    '1': '通知',
    '2': '公告',
    '3': '政策',
    '4': '新闻'
  }
  return map[type] || '未知'
}

const getNoticeTypeTag = (type: string) => {
  const map: Record<string, string> = {
    '1': 'primary',
    '2': 'success',
    '3': 'warning',
    '4': 'info'
  }
  return map[type] || ''
}

// 窗口大小改变时重绘图表
const handleResize = () => {
  employmentTrendChart?.resize()
  projectStatusChart?.resize()
  collegeChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  employmentTrendChart?.dispose()
  projectStatusChart?.dispose()
  collegeChart?.dispose()
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

  .avatar-box {
    background: rgba(255,255,255, 0.2);
    padding: 10px;
    border-radius: 8px;
    display: flex;
  }
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
  margin-bottom: 20px;

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
