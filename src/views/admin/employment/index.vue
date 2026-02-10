<template>
  <div class="app-container">
    <!-- 顶部筛选 -->
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true">
        <el-form-item label="毕业届别">
          <el-select v-model="graduationYear" placeholder="选择届别" style="width: 150px" @change="loadData">
            <el-option label="2026届" :value="2026" />
            <el-option label="2025届" :value="2025" />
            <el-option label="2024届" :value="2024" />
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
              <div class="text-sm opacity-80 mb-1">毕业生总数</div>
              <div class="text-3xl font-bold font-mono">{{ kpiData.totalGraduates || 0 }}</div>
              <div class="text-xs mt-2">{{ graduationYear }}届</div>
            </div>
            <el-icon class="text-4xl opacity-30"><User /></el-icon>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card bg-green-gradient">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm opacity-80 mb-1">总体就业率</div>
              <div class="text-3xl font-bold font-mono">{{ kpiData.employmentRate || '0%' }}</div>
              <div class="text-xs mt-2">已就业 {{ kpiData.employedCount || 0 }} 人</div>
            </div>
            <el-icon class="text-4xl opacity-30"><TrendCharts /></el-icon>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card bg-purple-gradient">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm opacity-80 mb-1">创业人数</div>
              <div class="text-3xl font-bold font-mono">{{ kpiData.entrepreneurshipCount || 0 }}</div>
              <div class="text-xs mt-2">创业率 {{ kpiData.entrepreneurshipRate || '0%' }}</div>
            </div>
            <el-icon class="text-4xl opacity-30"><Suitcase /></el-icon>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card bg-orange-gradient">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm opacity-80 mb-1">平均期望薪资</div>
              <div class="text-3xl font-bold font-mono">{{ kpiData.avgSalary || 0 }}</div>
              <div class="text-xs mt-2">元/月</div>
            </div>
            <el-icon class="text-4xl opacity-30"><Money /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 中间图表区域 -->
    <el-row :gutter="20" class="mb-4">
      <!-- 各校就业率排行榜 -->
      <el-col :span="14">
        <el-card shadow="never" class="h-full" v-loading="loading">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold text-gray-800 flex items-center">
                <el-icon class="mr-2 text-blue-500"><Histogram /></el-icon>
                各校就业率排行榜 (红绿灯监管)
              </span>
              <el-tag type="danger" size="small" v-if="lowSchoolCount > 0">
                {{ lowSchoolCount }} 所学校低于85%
              </el-tag>
            </div>
          </template>
          <div ref="rankChartRef" style="height: 400px;"></div>
        </el-card>
      </el-col>

      <!-- 就业状态分布 -->
      <el-col :span="10">
        <el-card shadow="never" class="h-full" v-loading="loading">
          <template #header>
            <span class="font-bold text-gray-800">就业状态分布</span>
          </template>
          <div ref="statusChartRef" style="height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部图表区域 -->
    <el-row :gutter="20">
      <!-- 薪资分布 -->
      <el-col :span="8">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <span class="font-bold text-gray-800">期望薪资分布</span>
          </template>
          <div ref="salaryChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 热门行业 -->
      <el-col :span="8">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <span class="font-bold text-gray-800">热门就业行业 TOP5</span>
          </template>
          <div ref="industryChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 创业项目统计 -->
      <el-col :span="8">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <span class="font-bold text-gray-800">创业项目统计</span>
          </template>
          <div class="entrepreneurship-stats">
            <div class="stat-item">
              <div class="label">项目总数</div>
              <div class="value text-blue-600">{{ entrepreneurshipData.totalProjects || 0 }}</div>
            </div>
            <div class="stat-item">
              <div class="label">已通过</div>
              <div class="value text-green-600">{{ entrepreneurshipData.approvedProjects || 0 }}</div>
            </div>
            <div class="stat-item">
              <div class="label">待审核</div>
              <div class="value text-orange-600">{{ entrepreneurshipData.pendingProjects || 0 }}</div>
            </div>
          </div>
          <el-divider />
          <div ref="domainChartRef" style="height: 180px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import {
  User, TrendCharts, Money, Suitcase, Histogram, Refresh
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getEmploymentOverview } from '@/api/employment'

// --- State ---
const loading = ref(false)
const graduationYear = ref(2026)

// KPI数据
const kpiData = ref({
  totalGraduates: 0,
  employedCount: 0,
  employmentRate: '0%',
  entrepreneurshipCount: 0,
  entrepreneurshipRate: '0%',
  avgSalary: '0'
})

// 各校排行数据
const schoolRankData = ref<any[]>([])

// 就业状态数据
const employmentStatusData = ref<any[]>([])

// 薪资分布数据
const salaryData = ref<any[]>([])

// 热门行业数据
const industryData = ref<any[]>([])

// 创业数据
const entrepreneurshipData = ref({
  totalProjects: 0,
  approvedProjects: 0,
  pendingProjects: 0,
  domainDistribution: []
})

// 计算低于85%的学校数量
const lowSchoolCount = computed(() => {
  return schoolRankData.value.filter(item => item.employmentRate < 85).length
})

// --- Chart Refs ---
const rankChartRef = ref()
const statusChartRef = ref()
const salaryChartRef = ref()
const industryChartRef = ref()
const domainChartRef = ref()

let charts: echarts.ECharts[] = []

// --- 加载数据 ---
const loadData = async () => {
  loading.value = true
  try {
    const res = await getEmploymentOverview(graduationYear.value)
    const data = res.data

    // 更新KPI数据
    kpiData.value = data.kpi

    // 更新各模块数据
    schoolRankData.value = data.schoolRank || []
    employmentStatusData.value = data.employmentStatus || []
    salaryData.value = data.salaryDistribution || []
    industryData.value = data.hotIndustries || []
    entrepreneurshipData.value = data.entrepreneurship || {
      totalProjects: 0,
      approvedProjects: 0,
      pendingProjects: 0,
      domainDistribution: []
    }

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

  // 1. 学校排行榜
  if (rankChartRef.value && schoolRankData.value.length > 0) {
    const rankChart = echarts.init(rankChartRef.value)
    rankChart.setOption({
      tooltip: { 
        trigger: 'axis', 
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = params[0]
          const item = schoolRankData.value[data.dataIndex]
          return `${data.name}<br/>
                  就业率: ${data.value}%<br/>
                  已就业: ${item.employedStudents}人<br/>
                  总人数: ${item.totalStudents}人`
        }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      yAxis: {
        type: 'category',
        data: schoolRankData.value.map(item => item.schoolName),
        inverse: true
      },
      series: [
        {
          name: '就业率',
          type: 'bar',
          data: schoolRankData.value.map(item => item.employmentRate),
          itemStyle: {
            color: (params: any) => {
              if (params.value < 85) return '#ef4444'
              if (params.value < 90) return '#eab308'
              return '#10b981'
            },
            borderRadius: [0, 4, 4, 0]
          },
          label: { show: true, position: 'right', formatter: '{c}%' }
        }
      ]
    })
    charts.push(rankChart)
  }

  // 2. 就业状态分布饼图
  if (statusChartRef.value && employmentStatusData.value.length > 0) {
    const statusChart = echarts.init(statusChartRef.value)
    statusChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
      legend: { bottom: '5%', left: 'center' },
      color: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'],
      series: [
        {
          name: '就业状态',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
          data: employmentStatusData.value.map(item => ({
            name: item.statusName,
            value: item.count
          }))
        }
      ]
    })
    charts.push(statusChart)
  }

  // 3. 薪资分布
  if (salaryChartRef.value && salaryData.value.length > 0) {
    const salaryChart = echarts.init(salaryChartRef.value)
    salaryChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '0%', left: 'center', itemWidth: 10, itemHeight: 10 },
      color: ['#94a3b8', '#60a5fa', '#3b82f6', '#1d4ed8'],
      series: [
        {
          name: '薪资范围',
          type: 'pie',
          radius: ['40%', '70%'],
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          data: salaryData.value.map(item => ({
            name: item.range,
            value: item.count
          }))
        }
      ]
    })
    charts.push(salaryChart)
  }

  // 4. 热门行业
  if (industryChartRef.value && industryData.value.length > 0) {
    const industryChart = echarts.init(industryChartRef.value)
    industryChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { top: '10%', bottom: '5%', left: '25%', containLabel: true },
      xAxis: { type: 'value', show: false },
      yAxis: {
        type: 'category',
        data: industryData.value.map(item => item.industry),
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          type: 'bar',
          data: industryData.value.map(item => item.count),
          itemStyle: { borderRadius: [0, 10, 10, 0], color: '#8b5cf6' },
          label: { show: true, position: 'right' },
          barWidth: 20
        }
      ]
    })
    charts.push(industryChart)
  }

  // 5. 创业领域分布
  if (domainChartRef.value && entrepreneurshipData.value.domainDistribution.length > 0) {
    const domainChart = echarts.init(domainChartRef.value)
    domainChart.setOption({
      tooltip: { trigger: 'item' },
      color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
      series: [
        {
          name: '创业领域',
          type: 'pie',
          radius: ['30%', '60%'],
          center: ['50%', '50%'],
          roseType: 'area',
          itemStyle: { borderRadius: 5 },
          label: { fontSize: 11 },
          data: entrepreneurshipData.value.domainDistribution.map((item: any) => ({
            name: item.domain,
            value: item.count
          }))
        }
      ]
    })
    charts.push(domainChart)
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

.entrepreneurship-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;

  .stat-item {
    text-align: center;

    .label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }

    .value {
      font-size: 28px;
      font-weight: bold;
      font-family: 'Courier New', monospace;
    }
  }
}
</style>
