<template>
  <div class="app-container">
    <!-- 顶部筛选 -->
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true">
        <el-form-item label="学院">
          <el-select v-model="selectedCollege" placeholder="全部学院" clearable style="width: 180px" @change="loadData">
            <el-option
              v-for="college in collegeList"
              :key="college"
              :label="college"
              :value="college"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Refresh" @click="loadData">刷新数据</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- KPI卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card bg-blue-gradient">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm opacity-80 mb-1">项目总数</div>
              <div class="text-3xl font-bold font-mono">{{ kpiData.totalProjects || 0 }}</div>
              <div class="text-xs mt-2">本校创业项目</div>
            </div>
            <el-icon class="text-4xl opacity-30"><Suitcase /></el-icon>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card bg-green-gradient">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm opacity-80 mb-1">孵化中</div>
              <div class="text-3xl font-bold font-mono">{{ kpiData.incubatingCount || 0 }}</div>
              <div class="text-xs mt-2">孵化率 {{ kpiData.incubatingRate || '0%' }}</div>
            </div>
            <el-icon class="text-4xl opacity-30"><TrendCharts /></el-icon>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card bg-purple-gradient">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm opacity-80 mb-1">待审核</div>
              <div class="text-3xl font-bold font-mono">{{ kpiData.pendingCount || 0 }}</div>
              <div class="text-xs mt-2">需要及时处理</div>
            </div>
            <el-icon class="text-4xl opacity-30"><Clock /></el-icon>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card bg-orange-gradient">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm opacity-80 mb-1">创造岗位</div>
              <div class="text-3xl font-bold font-mono">{{ kpiData.totalJobs || 0 }}</div>
              <div class="text-xs mt-2">个就业岗位</div>
            </div>
            <el-icon class="text-4xl opacity-30"><User /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 中间图表区域 -->
    <el-row :gutter="20" class="mb-4">
      <!-- 各学院项目数量 -->
      <el-col :span="12">
        <el-card shadow="never" class="h-full" v-loading="loading">
          <template #header>
            <span class="font-bold text-gray-800 flex items-center">
              <el-icon class="mr-2 text-blue-500"><School /></el-icon>
              各学院项目数量
            </span>
          </template>
          <div ref="collegeChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>

      <!-- 项目状态分布 -->
      <el-col :span="12">
        <el-card shadow="never" class="h-full" v-loading="loading">
          <template #header>
            <span class="font-bold text-gray-800">项目状态分布</span>
          </template>
          <div ref="statusChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部图表区域 -->
    <el-row :gutter="20" class="mb-4">
      <!-- 项目领域分布 -->
      <el-col :span="12">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <span class="font-bold text-gray-800">项目领域分布</span>
          </template>
          <div ref="domainChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 团队规模分布 -->
      <el-col :span="12">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <span class="font-bold text-gray-800">团队规模分布</span>
          </template>
          <div ref="teamSizeChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部图表区域2 -->
    <el-row :gutter="20">
      <!-- 月度项目趋势 -->
      <el-col :span="16">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <span class="font-bold text-gray-800">月度项目趋势</span>
          </template>
          <div ref="trendChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 项目成功率 -->
      <el-col :span="8">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <span class="font-bold text-gray-800">项目成功率</span>
          </template>
          <div class="success-stats">
            <div class="stat-item">
              <div class="label">审核通过率</div>
              <div class="value text-green-600">{{ successData.approvalRate || '0%' }}</div>
              <div class="desc">{{ successData.approvedCount || 0 }}/{{ successData.submittedCount || 0 }}</div>
            </div>
            <el-divider />
            <div class="stat-item">
              <div class="label">项目落地率</div>
              <div class="value text-blue-600">{{ successData.landingRate || '0%' }}</div>
              <div class="desc">{{ successData.landedCount || 0 }}/{{ successData.approvedCount || 0 }}</div>
            </div>
            <el-divider />
            <div class="stat-item">
              <div class="label">平均团队规模</div>
              <div class="value text-purple-600">{{ successData.avgTeamSize || 0 }}人</div>
              <div class="desc">每个项目平均</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import {
  User, TrendCharts, Suitcase, Refresh, School, Clock
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getSchoolEntrepreneurshipStats } from '@/api/school'

// --- State ---
const loading = ref(false)
const selectedCollege = ref('')
const collegeList = ref<string[]>([])

// KPI数据
const kpiData = ref({
  totalProjects: 0,
  incubatingCount: 0,
  incubatingRate: '0%',
  pendingCount: 0,
  totalJobs: 0
})

// 各学院项目数量数据
const collegeData = ref<any[]>([])

// 项目状态数据
const statusData = ref<any[]>([])

// 项目领域数据
const domainData = ref<any[]>([])

// 团队规模数据
const teamSizeData = ref<any[]>([])

// 月度趋势数据
const trendData = ref<any[]>([])

// 成功率数据
const successData = ref({
  approvalRate: '0%',
  approvedCount: 0,
  submittedCount: 0,
  landingRate: '0%',
  landedCount: 0,
  avgTeamSize: 0
})

// --- Chart Refs ---
const collegeChartRef = ref()
const statusChartRef = ref()
const domainChartRef = ref()
const teamSizeChartRef = ref()
const trendChartRef = ref()

let charts: echarts.ECharts[] = []

// --- 加载数据 ---
const loadData = async () => {
  loading.value = true
  try {
    const res = await getSchoolEntrepreneurshipStats(selectedCollege.value)
    const data = res.data

    // 更新KPI数据
    kpiData.value = data.kpi

    // 更新学院列表
    collegeList.value = data.collegeList || []

    // 更新各模块数据
    collegeData.value = data.collegeStats || []
    statusData.value = data.statusDistribution || []
    domainData.value = data.domainDistribution || []
    teamSizeData.value = data.teamSizeDistribution || []
    trendData.value = data.monthlyTrend || []
    successData.value = data.successStats || {}

    // 重新渲染图表
    initCharts()
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
  charts.forEach(chart => chart.dispose())
  charts = []

  // 1. 各学院项目数量
  if (collegeChartRef.value && collegeData.value.length > 0) {
    const collegeChart = echarts.init(collegeChartRef.value)
    collegeChart.setOption({
      tooltip: { 
        trigger: 'axis', 
        axisPointer: { type: 'shadow' }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value' },
      yAxis: {
        type: 'category',
        data: collegeData.value.map(item => item.collegeName),
        inverse: true,
        axisLabel: { fontSize: 12 }
      },
      series: [
        {
          name: '项目数量',
          type: 'bar',
          data: collegeData.value.map(item => item.count),
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
    charts.push(collegeChart)
  }

  // 2. 项目状态分布
  if (statusChartRef.value && statusData.value.length > 0) {
    const statusChart = echarts.init(statusChartRef.value)
    statusChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}个 ({d}%)' },
      legend: { bottom: '5%', left: 'center' },
      color: ['#f59e0b', '#10b981', '#ef4444', '#3b82f6'],
      series: [
        {
          name: '项目状态',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
          data: statusData.value.map(item => ({
            name: item.statusName,
            value: item.count
          }))
        }
      ]
    })
    charts.push(statusChart)
  }

  // 3. 项目领域分布
  if (domainChartRef.value && domainData.value.length > 0) {
    const domainChart = echarts.init(domainChartRef.value)
    domainChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}个 ({d}%)' },
      legend: { bottom: '5%', left: 'center', textStyle: { fontSize: 11 } },
      color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'],
      series: [
        {
          name: '项目领域',
          type: 'pie',
          radius: ['30%', '60%'],
          center: ['50%', '45%'],
          roseType: 'area',
          itemStyle: { borderRadius: 5 },
          label: { fontSize: 11 },
          data: domainData.value.map(item => ({
            name: item.domain,
            value: item.count
          }))
        }
      ]
    })
    charts.push(domainChart)
  }

  // 4. 团队规模分布
  if (teamSizeChartRef.value && teamSizeData.value.length > 0) {
    const teamSizeChart = echarts.init(teamSizeChartRef.value)
    teamSizeChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}个项目 ({d}%)' },
      legend: { bottom: '5%', left: 'center' },
      color: ['#94a3b8', '#60a5fa', '#3b82f6', '#1d4ed8', '#1e40af'],
      series: [
        {
          name: '团队规模',
          type: 'pie',
          radius: ['40%', '70%'],
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
          data: teamSizeData.value.map(item => ({
            name: item.range,
            value: item.count
          }))
        }
      ]
    })
    charts.push(teamSizeChart)
  }

  // 5. 月度项目趋势
  if (trendChartRef.value && trendData.value.length > 0) {
    const trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { top: '5%', left: 'center' },
      grid: { top: '15%', bottom: '10%', left: '10%', right: '5%' },
      xAxis: {
        type: 'category',
        data: trendData.value.map(item => item.month),
        boundaryGap: false
      },
      yAxis: { type: 'value', name: '项目数' },
      series: [
        {
          name: '新增项目',
          type: 'line',
          data: trendData.value.map(item => item.newCount),
          smooth: true,
          itemStyle: { color: '#3b82f6' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
              ]
            }
          }
        },
        {
          name: '审核通过',
          type: 'line',
          data: trendData.value.map(item => item.approvedCount),
          smooth: true,
          itemStyle: { color: '#10b981' }
        }
      ]
    })
    charts.push(trendChart)
  }
}

// 窗口大小改变时重绘图表
const handleResize = () => {
  charts.forEach(chart => chart.resize())
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(chart => chart.dispose())
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.kpi-card {
  color: white;
  border-radius: 8px;
  border: none;
  transition: transform 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-3px);
  }

  &.bg-blue-gradient {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }
  &.bg-green-gradient {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }
  &.bg-purple-gradient {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  }
  &.bg-orange-gradient {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }
}

.success-stats {
  padding: 20px 10px;

  .stat-item {
    text-align: center;
    padding: 10px 0;

    .label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 12px;
    }

    .value {
      font-size: 32px;
      font-weight: bold;
      font-family: 'Courier New', monospace;
      margin-bottom: 8px;
    }

    .desc {
      font-size: 12px;
      color: #c0c4cc;
    }
  }
}
</style>
