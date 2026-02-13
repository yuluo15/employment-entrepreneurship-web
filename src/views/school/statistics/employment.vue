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
              <div class="text-sm opacity-80 mb-1">本校就业率</div>
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
              <div class="text-sm opacity-80 mb-1">创业项目</div>
              <div class="text-3xl font-bold font-mono">{{ kpiData.entrepreneurshipCount || 0 }}</div>
              <div class="text-xs mt-2">孵化中 {{ kpiData.incubatingCount || 0 }} 个</div>
            </div>
            <el-icon class="text-4xl opacity-30"><Suitcase /></el-icon>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card bg-orange-gradient">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm opacity-80 mb-1">平均薪资</div>
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
      <!-- 各学院就业率 -->
      <el-col :span="12">
        <el-card shadow="never" class="h-full" v-loading="loading">
          <template #header>
            <span class="font-bold text-gray-800 flex items-center">
              <el-icon class="mr-2 text-blue-500"><School /></el-icon>
              各学院就业率
            </span>
          </template>
          <div ref="collegeChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>

      <!-- 各专业就业率 TOP10 -->
      <el-col :span="12">
        <el-card shadow="never" class="h-full" v-loading="loading">
          <template #header>
            <span class="font-bold text-gray-800 flex items-center">
              <el-icon class="mr-2 text-green-500"><Histogram /></el-icon>
              各专业就业率 TOP10
            </span>
          </template>
          <div ref="majorChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部图表区域 -->
    <el-row :gutter="20" class="mb-4">
      <!-- 就业去向 TOP10 -->
      <el-col :span="12">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <span class="font-bold text-gray-800 flex items-center">
              <el-icon class="mr-2 text-purple-500"><OfficeBuilding /></el-icon>
              学生就业去向 TOP10
            </span>
          </template>
          <div ref="companyChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 薪资分布 -->
      <el-col :span="12">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <span class="font-bold text-gray-800">薪资分布</span>
          </template>
          <div ref="salaryChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部图表区域2 -->
    <el-row :gutter="20">
      <!-- 就业行业分布 -->
      <el-col :span="12">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <span class="font-bold text-gray-800">就业行业分布 TOP8</span>
          </template>
          <div ref="industryChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 月度就业趋势 -->
      <el-col :span="12">
        <el-card shadow="never" v-loading="loading">
          <template #header>
            <span class="font-bold text-gray-800">月度就业趋势</span>
          </template>
          <div ref="trendChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import {
  User, TrendCharts, Money, Suitcase, Histogram, Refresh, School, OfficeBuilding
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getSchoolEmploymentStats } from '@/api/school'

// --- State ---
const loading = ref(false)
const graduationYear = ref(2026)
const selectedCollege = ref('')
const collegeList = ref<string[]>([])

// KPI数据
const kpiData = ref({
  totalGraduates: 0,
  employedCount: 0,
  employmentRate: '0%',
  entrepreneurshipCount: 0,
  incubatingCount: 0,
  avgSalary: '0'
})

// 各学院就业率数据
const collegeData = ref<any[]>([])

// 各专业就业率数据
const majorData = ref<any[]>([])

// 就业去向数据
const companyData = ref<any[]>([])

// 薪资分布数据
const salaryData = ref<any[]>([])

// 热门行业数据
const industryData = ref<any[]>([])

// 月度趋势数据
const trendData = ref<any[]>([])

// --- Chart Refs ---
const collegeChartRef = ref()
const majorChartRef = ref()
const companyChartRef = ref()
const salaryChartRef = ref()
const industryChartRef = ref()
const trendChartRef = ref()

let charts: echarts.ECharts[] = []

// --- 加载数据 ---
const loadData = async () => {
  loading.value = true
  try {
    const res = await getSchoolEmploymentStats(graduationYear.value, selectedCollege.value)
    const data = res.data

    // 更新KPI数据
    kpiData.value = data.kpi

    // 更新学院列表
    collegeList.value = data.collegeList || []

    // 更新各模块数据
    collegeData.value = data.collegeStats || []
    majorData.value = data.majorStats || []
    companyData.value = data.topCompanies || []
    salaryData.value = data.salaryDistribution || []
    industryData.value = data.industryDistribution || []
    trendData.value = data.monthlyTrend || []

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

  // 1. 各学院就业率
  if (collegeChartRef.value && collegeData.value.length > 0) {
    const collegeChart = echarts.init(collegeChartRef.value)
    collegeChart.setOption({
      tooltip: { 
        trigger: 'axis', 
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = params[0]
          const item = collegeData.value[data.dataIndex]
          return `${data.name}<br/>
                  就业率: ${data.value}%<br/>
                  已就业: ${item.employedCount}人<br/>
                  总人数: ${item.totalCount}人`
        }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      yAxis: {
        type: 'category',
        data: collegeData.value.map(item => item.collegeName),
        inverse: true,
        axisLabel: { fontSize: 12 }
      },
      series: [
        {
          name: '就业率',
          type: 'bar',
          data: collegeData.value.map(item => item.employmentRate),
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
    charts.push(collegeChart)
  }

  // 2. 各专业就业率 TOP10
  if (majorChartRef.value && majorData.value.length > 0) {
    const majorChart = echarts.init(majorChartRef.value)
    majorChart.setOption({
      tooltip: { 
        trigger: 'axis', 
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = params[0]
          const item = majorData.value[data.dataIndex]
          return `${data.name}<br/>
                  就业率: ${data.value}%<br/>
                  已就业: ${item.employedCount}人<br/>
                  总人数: ${item.totalCount}人`
        }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      yAxis: {
        type: 'category',
        data: majorData.value.map(item => item.majorName),
        inverse: true,
        axisLabel: { fontSize: 11 }
      },
      series: [
        {
          name: '就业率',
          type: 'bar',
          data: majorData.value.map(item => item.employmentRate),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: '#34d399' }
            ]),
            borderRadius: [0, 4, 4, 0]
          },
          label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11 }
        }
      ]
    })
    charts.push(majorChart)
  }

  // 3. 就业去向 TOP10
  if (companyChartRef.value && companyData.value.length > 0) {
    const companyChart = echarts.init(companyChartRef.value)
    companyChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { top: '10%', bottom: '5%', left: '3%', right: '4%', containLabel: true },
      xAxis: { type: 'value', show: false },
      yAxis: {
        type: 'category',
        data: companyData.value.map(item => item.companyName),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 11 }
      },
      series: [
        {
          type: 'bar',
          data: companyData.value.map(item => item.count),
          itemStyle: { 
            borderRadius: [0, 10, 10, 0], 
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#8b5cf6' },
              { offset: 1, color: '#a78bfa' }
            ])
          },
          label: { show: true, position: 'right', fontSize: 11 },
          barWidth: 18
        }
      ]
    })
    charts.push(companyChart)
  }

  // 4. 薪资分布
  if (salaryChartRef.value && salaryData.value.length > 0) {
    const salaryChart = echarts.init(salaryChartRef.value)
    salaryChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
      legend: { bottom: '5%', left: 'center', itemWidth: 10, itemHeight: 10 },
      color: ['#94a3b8', '#60a5fa', '#3b82f6', '#1d4ed8', '#1e40af'],
      series: [
        {
          name: '薪资范围',
          type: 'pie',
          radius: ['40%', '70%'],
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
          data: salaryData.value.map(item => ({
            name: item.range,
            value: item.count
          }))
        }
      ]
    })
    charts.push(salaryChart)
  }

  // 5. 就业行业分布
  if (industryChartRef.value && industryData.value.length > 0) {
    const industryChart = echarts.init(industryChartRef.value)
    industryChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
      legend: { bottom: '5%', left: 'center', itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 11 } },
      color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'],
      series: [
        {
          name: '行业',
          type: 'pie',
          radius: ['30%', '60%'],
          center: ['50%', '45%'],
          roseType: 'area',
          itemStyle: { borderRadius: 5 },
          label: { fontSize: 11 },
          data: industryData.value.map(item => ({
            name: item.industry,
            value: item.count
          }))
        }
      ]
    })
    charts.push(industryChart)
  }

  // 6. 月度就业趋势
  if (trendChartRef.value && trendData.value.length > 0) {
    const trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { top: '15%', bottom: '10%', left: '10%', right: '5%' },
      xAxis: {
        type: 'category',
        data: trendData.value.map(item => item.month),
        boundaryGap: false
      },
      yAxis: { type: 'value', name: '人数' },
      series: [
        {
          name: '就业人数',
          type: 'line',
          data: trendData.value.map(item => item.count),
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
</style>
