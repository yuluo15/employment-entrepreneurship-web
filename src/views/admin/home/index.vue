<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4 welcome-card">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="avatar-box mr-4">
            <el-icon :size="32" color="white"><DataBoard /></el-icon>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800">
              高校创业就业服务平台 - 决策驾驶舱
            </h2>
            <p class="text-gray-500 mt-2 text-sm">
              <el-tag effect="dark" type="danger" class="mr-2">ROOT管理员</el-tag>
              <span class="mr-4">当前日期：{{ currentDate }}</span>
            </p>
          </div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" class="mb-4" v-loading="loading">
      <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in statCards" :key="index">
        <el-card shadow="hover" class="stat-card mb-4" :body-style="{ padding: '20px' }">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-gray-500 text-sm mb-2">{{ item.title }}</div>
              <div class="text-3xl font-bold text-gray-800 font-mono">{{ item.value }}</div>
            </div>
            <div class="icon-bg" :style="{ background: item.bgColor }">
              <el-icon :size="24" :color="item.iconColor"><component :is="item.icon" /></el-icon>
            </div>
          </div>
          <div class="mt-3 text-xs text-gray-400">
            <span>{{ item.subTitle }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :lg="16" class="mb-4">
        <el-card shadow="never" class="h-full" v-loading="loading">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">各校学生数量排行</span>
            </div>
          </template>
          <div ref="schoolChartRef" style="height: 400px;"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8" class="mb-4">
        <el-card shadow="never" class="h-full" v-loading="loading">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">待处理审批</span>
              <el-badge :value="pendingCount" type="danger" v-if="pendingCount > 0" />
            </div>
          </template>
          <div class="todo-list">
            <div class="todo-item" v-if="pendingJobs > 0">
              <div class="flex items-start">
                <el-tag type="warning" size="small" class="mr-3 mt-0.5">岗位审核</el-tag>
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-800 mb-1">待审核岗位</div>
                  <div class="text-xs text-gray-400">共 {{ pendingJobs }} 个岗位待审核</div>
                </div>
              </div>
              <el-button link type="primary" size="small" @click="router.push('/admin/jobAudit')">处理</el-button>
            </div>
            <div class="todo-item" v-if="pendingProjects > 0">
              <div class="flex items-start">
                <el-tag type="success" size="small" class="mr-3 mt-0.5">创业项目</el-tag>
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-800 mb-1">待审核创业项目</div>
                  <div class="text-xs text-gray-400">共 {{ pendingProjects }} 个项目待审核</div>
                </div>
              </div>
              <el-button link type="primary" size="small" @click="router.push('/admin/entrep')">处理</el-button>
            </div>
            <div v-if="pendingCount === 0" class="text-center text-gray-400 py-10">
              <el-icon :size="48" class="mb-2"><CircleCheck /></el-icon>
              <div>暂无待办事项</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">创业项目领域分布</span>
            </div>
          </template>
          <div ref="domainChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" v-loading="loading">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold">最新入驻企业一览</span>
          <el-button link type="primary" @click="router.push('/admin/system/companyManage')">管理企业</el-button>
        </div>
      </template>
      <el-table :data="latestCompanies" style="width: 100%" size="small">
        <el-table-column prop="companyName" label="企业名称" min-width="200" />
        <el-table-column prop="industry" label="所属行业" width="150" />
        <el-table-column prop="jobCount" label="发布岗位" width="100" align="center">
          <template #default="{ row }"><span class="text-blue-500 font-bold">{{ row.jobCount }}</span></template>
        </el-table-column>
        <el-table-column prop="createTime" label="入驻时间" width="180" align="right" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  DataBoard, School, OfficeBuilding, User, UserFilled, CircleCheck
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getHomeOverview } from '@/api/home'

const router = useRouter()
const currentDate = computed(() => dayjs().format('YYYY年MM月DD日 dddd'))
const loading = ref(false)

// --- 核心指标数据 ---
const statCards = ref([
  {
    title: '入驻学校',
    value: 0,
    subTitle: '覆盖全省高校',
    icon: School,
    bgColor: '#ecf5ff',
    iconColor: '#409eff'
  },
  {
    title: '入驻企业',
    value: 0,
    subTitle: '提供就业岗位',
    icon: OfficeBuilding,
    bgColor: '#fdf6ec',
    iconColor: '#e6a23c'
  },
  {
    title: '学生总数',
    value: 0,
    subTitle: '平台注册学生',
    icon: User,
    bgColor: '#f0f9eb',
    iconColor: '#67c23a'
  },
  {
    title: '教师总数',
    value: 0,
    subTitle: '指导教师人数',
    icon: UserFilled,
    bgColor: '#f4f4f5',
    iconColor: '#909399'
  },
])

// --- 待办事项 ---
const pendingJobs = ref(0)
const pendingProjects = ref(0)
const pendingCount = computed(() => pendingJobs.value + pendingProjects.value)

// --- 学校排行数据 ---
const schoolRankData = ref<any[]>([])

// --- 创业领域分布 ---
const domainData = ref<any[]>([])

// --- 最新入驻企业 ---
const latestCompanies = ref<any[]>([])

// --- 图表引用 ---
const schoolChartRef = ref()
const domainChartRef = ref()
let schoolChart: any = null
let domainChart: any = null

// --- 加载数据 ---
const loadData = async () => {
  loading.value = true
  try {
    const res = await getHomeOverview()
    const data = res.data

    // 更新KPI数据
    statCards.value[0].value = data.schoolCount
    statCards.value[1].value = data.companyCount
    statCards.value[2].value = data.studentCount
    statCards.value[3].value = data.teacherCount

    // 更新待办数据
    pendingJobs.value = data.pendingJobs
    pendingProjects.value = data.pendingProjects

    // 更新学校排行
    schoolRankData.value = data.schoolRank || []

    // 更新创业领域分布
    domainData.value = data.domainDistribution || []

    // 更新最新企业
    latestCompanies.value = data.latestCompanies || []

    // 重新渲染图表
    nextTick(() => {
      initCharts()
    })
  } catch (error) {
    console.error('加载数据失败', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// --- 初始化图表 ---
const initCharts = () => {
  // 销毁旧图表
  schoolChart?.dispose()
  domainChart?.dispose()

  // 1. 学校学生数量排行
  if (schoolChartRef.value && schoolRankData.value.length > 0) {
    schoolChart = echarts.init(schoolChartRef.value)
    schoolChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: schoolRankData.value.map(item => item.schoolName),
        inverse: true
      },
      series: [
        {
          name: '学生数量',
          type: 'bar',
          data: schoolRankData.value.map(item => item.studentCount),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#60a5fa' }
            ]),
            borderRadius: [0, 4, 4, 0]
          },
          label: { show: true, position: 'right' }
        }
      ]
    })
  }

  // 2. 创业项目领域分布
  if (domainChartRef.value && domainData.value.length > 0) {
    domainChart = echarts.init(domainChartRef.value)
    domainChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}个 ({d}%)' },
      legend: { bottom: '5%', left: 'center' },
      color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'],
      series: [
        {
          name: '创业领域',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{b}\n{d}%' },
          emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
          data: domainData.value.map(item => ({
            name: item.domainLabel,
            value: item.count
          }))
        }
      ]
    })
  }
}

const resizeCharts = () => {
  schoolChart?.resize()
  domainChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  schoolChart?.dispose()
  domainChart?.dispose()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.welcome-card {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); // 深蓝商务风
  color: white;
  border: none;

  :deep(.el-card__body) { color: white; }
  h2 { color: white; }
  p { color: rgba(255,255,255, 0.8); }

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

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 15px;
  text-align: center;
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
</style>