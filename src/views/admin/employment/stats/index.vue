<template>
  <div class="app-container">
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6" v-for="(item, index) in kpiList" :key="index">
        <el-card shadow="hover" class="kpi-card border-none" :class="item.bgClass">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm opacity-80 mb-1">{{ item.label }}</div>
              <div class="text-3xl font-bold font-mono">{{ item.value }}</div>
              <div class="text-xs mt-2 flex items-center">
                <span class="mr-1">{{ item.subLabel }}:</span>
                <span :class="item.trend > 0 ? 'text-red-600' : 'text-green-600'" class="font-bold bg-white px-1 rounded">
                  {{ item.trend > 0 ? '+' : '' }}{{ item.trend }}%
                  <el-icon><Top v-if="item.trend > 0"/><Bottom v-else/></el-icon>
                </span>
              </div>
            </div>
            <el-icon class="text-4xl opacity-30 text-white"><component :is="item.icon" /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mb-4">
      <el-col :span="14">
        <el-card shadow="never" class="h-full">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold text-gray-800 flex items-center">
                <el-icon class="mr-2 text-blue-500"><Histogram /></el-icon>
                各校落实率排行榜 (红绿灯监管)
              </span>
              <el-radio-group v-model="rankType" size="small">
                <el-radio-button label="rate">就业率</el-radio-button>
                <el-radio-button label="count">就业人数</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="rankChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card shadow="never" class="h-full">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold text-gray-800 flex items-center">
                <el-icon class="mr-2 text-green-500"><MapLocation /></el-icon>
                人才流向分布
              </span>
              <el-tag type="success" size="small">本省留存率: 68.5%</el-tag>
            </div>
          </template>
          <div ref="mapChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span class="font-bold text-gray-800">薪资分布 (元/月)</span>
          </template>
          <div ref="salaryChartRef" style="height: 250px;"></div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span class="font-bold text-gray-800">就业去向构成</span>
          </template>
          <div ref="typeChartRef" style="height: 250px;"></div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span class="font-bold text-gray-800">热门行业 Top5</span>
          </template>
          <div ref="industryChartRef" style="height: 250px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import * as echarts from 'echarts'
import {
  User, TrendCharts, Money, Suitcase,
  Top, Bottom, Histogram, MapLocation
} from '@element-plus/icons-vue'

// --- 1. KPI Data ---
const kpiList = [
  { label: '毕业生总数', value: '56,200', subLabel: '同比去年', trend: 5.2, icon: User, bgClass: 'bg-blue-gradient' },
  { label: '总体落实率', value: '88.5%', subLabel: '同比去年', trend: 2.1, icon: TrendCharts, bgClass: 'bg-green-gradient' },
  { label: '创业率', value: '3.2%', subLabel: '带动就业', trend: 15.4, icon: Suitcase, bgClass: 'bg-purple-gradient' }, // 创业带动就业人数放这里展示不下，可以放在tooltip
  { label: '困难生落实率', value: '92.0%', subLabel: '帮扶完成', trend: 0.5, icon: Money, bgClass: 'bg-orange-gradient' }
]

// --- 2. Chart Refs ---
const rankChartRef = ref()
const mapChartRef = ref()
const salaryChartRef = ref()
const typeChartRef = ref()
const industryChartRef = ref()

let charts: echarts.ECharts[] = []
const rankType = ref('rate')

// --- 3. Chart Initialization Logic ---

const initCharts = () => {
  // --- A. 学校排行榜 (监管核心) ---
  const rankChart = echarts.init(rankChartRef.value)
  rankChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    yAxis: {
      type: 'category',
      data: ['成都理工', '西南交大', '川大锦江', '电子科大', '四川师范'],
      inverse: true // 高的在上面
    },
    series: [
      {
        name: '就业率',
        type: 'bar',
        data: [98.5, 96.2, 92.1, 88.5, 76.4],
        itemStyle: {
          // 红绿灯逻辑：低于 85% 变红，高于 90% 变绿
          color: (params: any) => {
            if (params.value < 85) return '#ef4444' // red
            if (params.value < 95) return '#eab308' // yellow
            return '#10b981' // green
          },
          borderRadius: [0, 4, 4, 0]
        },
        label: { show: true, position: 'right', formatter: '{c}%' }
      }
    ]
  })
  charts.push(rankChart)

  // --- B. 地区分布 (暂用横向柱图模拟，真实项目需引入 Map) ---
  const mapChart = echarts.init(mapChartRef.value)
  mapChart.setOption({
    tooltip: { trigger: 'item' },
    title: { text: 'TOP 5 流向城市', left: 'center', textStyle: { fontSize: 14 } },
    xAxis: { type: 'category', data: ['成都', '重庆', '深圳', '北京', '上海'] },
    yAxis: { type: 'value' },
    series: [{
      data: [35000, 5200, 4100, 3800, 2200],
      type: 'bar',
      itemStyle: { color: '#3b82f6' },
      barWidth: '40%'
    }]
  })
  charts.push(mapChart)

  // --- C. 薪资分布 (Pie) ---
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
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        data: [
          { value: 1048, name: '3k以下' },
          { value: 735, name: '3k-5k' },
          { value: 580, name: '5k-8k' },
          { value: 484, name: '8k以上' }
        ]
      }
    ]
  })
  charts.push(salaryChart)

  // --- D. 就业性质 (Rose) ---
  const typeChart = echarts.init(typeChartRef.value)
  typeChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { show: false },
    color: ['#10b981', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899'],
    series: [
      {
        name: '就业形式',
        type: 'pie',
        radius: [20, 80],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: { borderRadius: 8 },
        data: [
          { value: 40, name: '签协议' },
          { value: 30, name: '升学' },
          { value: 15, name: '灵活就业' },
          { value: 10, name: '创业' },
          { value: 5, name: '参军' }
        ]
      }
    ]
  })
  charts.push(typeChart)

  // --- E. 热门行业 (Bar) ---
  const industryChart = echarts.init(industryChartRef.value)
  industryChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: '10%', bottom: '0%', left: '20%', containLabel: true },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category',
      data: ['教育', '建筑', '金融', '制造', 'IT互联网'],
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        type: 'bar',
        data: [1200, 1800, 2400, 3100, 4500],
        itemStyle: { borderRadius: [0, 10, 10, 0], color: '#8b5cf6' },
        label: { show: true, position: 'right' },
        barWidth: 15
      }
    ]
  })
  charts.push(industryChart)
}

// 窗口大小改变时重绘图表
const handleResize = () => {
  charts.forEach(chart => chart.resize())
}

onMounted(() => {
  initCharts()
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

<!--<template>-->
<!--  <div class="app-container">-->
<!--    <el-card shadow="never" class="mb-4">-->
<!--      <div class="flex justify-between items-center">-->
<!--        <div class="flex items-center">-->
<!--          <span class="font-bold text-gray-700 text-lg mr-4">全省就业数据驾驶舱</span>-->
<!--          <el-radio-group v-model="currentYear" size="small">-->
<!--            <el-radio-button label="2026届" />-->
<!--            <el-radio-button label="2025届" />-->
<!--            <el-radio-button label="2024届" />-->
<!--          </el-radio-group>-->
<!--        </div>-->
<!--        <div>-->
<!--          <el-button type="primary" plain icon="Download" @click="handleExportReport">导出分析报告</el-button>-->
<!--        </div>-->
<!--      </div>-->
<!--    </el-card>-->

<!--    <el-row :gutter="20" class="mb-4">-->
<!--      <el-col :span="6" v-for="(card, index) in kpiCards" :key="index">-->
<!--        <el-card shadow="hover" class="kpi-card" :class="card.bgClass">-->
<!--          <div class="flex justify-between items-start">-->
<!--            <div>-->
<!--              <div class="text-gray-500 text-sm">{{ card.title }}</div>-->
<!--              <div class="text-2xl font-bold mt-2" :class="card.textClass">{{ card.value }}</div>-->
<!--              <div class="text-xs text-gray-400 mt-2">-->
<!--                同比 {{ card.yoy > 0 ? '+' : '' }}{{ card.yoy }}%-->
<!--                <el-icon :class="card.yoy > 0 ? 'text-red-500' : 'text-green-500'">-->
<!--                  <component :is="card.yoy > 0 ? 'CaretTop' : 'CaretBottom'" />-->
<!--                </el-icon>-->
<!--              </div>-->
<!--            </div>-->
<!--            <el-icon class="text-4xl opacity-20" :class="card.textClass"><component :is="card.icon" /></el-icon>-->
<!--          </div>-->
<!--        </el-card>-->
<!--      </el-col>-->
<!--    </el-row>-->

<!--    <el-row :gutter="20" class="mb-4">-->
<!--      <el-col :span="14">-->
<!--        <el-card shadow="never" class="chart-card">-->
<!--          <template #header>-->
<!--            <div class="flex justify-between items-center">-->
<!--              <span class="font-bold">各高校就业率排行 (红黑榜)</span>-->
<!--              <el-tag type="danger" size="small" effect="dark">3 所学校未达标</el-tag>-->
<!--            </div>-->
<!--          </template>-->
<!--          <div ref="schoolRankChartRef" style="height: 350px;"></div>-->
<!--        </el-card>-->
<!--      </el-col>-->

<!--      <el-col :span="10">-->
<!--        <el-card shadow="never" class="chart-card">-->
<!--          <template #header>-->
<!--            <span class="font-bold">毕业生去向构成</span>-->
<!--          </template>-->
<!--          <div ref="statusPieChartRef" style="height: 350px;"></div>-->
<!--        </el-card>-->
<!--      </el-col>-->
<!--    </el-row>-->

<!--    <el-row :gutter="20">-->
<!--      <el-col :span="8">-->
<!--        <el-card shadow="never" class="chart-card">-->
<!--          <template #header><span class="font-bold">薪资分布区间</span></template>-->
<!--          <div ref="salaryChartRef" style="height: 300px;"></div>-->
<!--        </el-card>-->
<!--      </el-col>-->
<!--      <el-col :span="8">-->
<!--        <el-card shadow="never" class="chart-card">-->
<!--          <template #header>-->
<!--            <span class="font-bold">创业领域分布 (特色)</span>-->
<!--            <el-tooltip content="统计选择“自主创业”学生的项目领域" placement="top"><el-icon class="ml-1"><InfoFilled /></el-icon></el-tooltip>-->
<!--          </template>-->
<!--          <div ref="startupChartRef" style="height: 300px;"></div>-->
<!--        </el-card>-->
<!--      </el-col>-->
<!--      <el-col :span="8">-->
<!--        <el-card shadow="never" class="chart-card">-->
<!--          <template #header><span class="font-bold">困难群体帮扶情况</span></template>-->
<!--          <div class="flex flex-col justify-center h-[300px] px-4">-->
<!--            <div v-for="item in poorHelpData" :key="item.label" class="mb-6">-->
<!--              <div class="flex justify-between mb-1">-->
<!--                <span class="text-sm font-medium text-gray-600">{{ item.label }}</span>-->
<!--                <span class="text-sm font-bold" :class="item.rate < 90 ? 'text-red-500' : 'text-blue-600'">{{ item.rate }}%</span>-->
<!--              </div>-->
<!--              <el-progress :percentage="item.rate" :status="item.rate < 90 ? 'exception' : 'success'" :stroke-width="10" />-->
<!--            </div>-->
<!--          </div>-->
<!--        </el-card>-->
<!--      </el-col>-->
<!--    </el-row>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import { ref, onMounted, nextTick } from 'vue'-->
<!--import * as echarts from 'echarts'-->
<!--import { CaretTop, CaretBottom, User, DataLine, Trophy, FirstAidKit, InfoFilled } from '@element-plus/icons-vue'-->
<!--import { ElMessage } from 'element-plus'-->

<!--// -&#45;&#45; State -&#45;&#45;-->
<!--const currentYear = ref('2026届')-->

<!--// KPI Data-->
<!--const kpiCards = ref([-->
<!--  { title: '毕业生总人数', value: '42,500', yoy: 5.2, icon: 'User', bgClass: 'bg-blue-50', textClass: 'text-blue-600' },-->
<!--  { title: '总体去向落实率', value: '88.4%', yoy: 1.8, icon: 'DataLine', bgClass: 'bg-green-50', textClass: 'text-green-600' },-->
<!--  { title: '自主创业人数', value: '1,240', yoy: 12.5, icon: 'Trophy', bgClass: 'bg-purple-50', textClass: 'text-purple-600' }, // 创业特色-->
<!--  { title: '困难生落实率', value: '91.2%', yoy: -0.5, icon: 'FirstAidKit', bgClass: 'bg-orange-50', textClass: 'text-orange-600' },-->
<!--])-->

<!--const poorHelpData = ref([-->
<!--  { label: '建档立卡贫困家庭', rate: 95.2 },-->
<!--  { label: '残疾毕业生', rate: 88.5 }, // 没到90%，红色预警-->
<!--  { label: '零就业家庭', rate: 100 },-->
<!--])-->

<!--// Chart Refs-->
<!--const schoolRankChartRef = ref(null)-->
<!--const statusPieChartRef = ref(null)-->
<!--const salaryChartRef = ref(null)-->
<!--const startupChartRef = ref(null)-->

<!--// -&#45;&#45; Chart Initialization -&#45;&#45;-->

<!--const initCharts = () => {-->
<!--  // 1. 各校排行 (Bar Chart)-->
<!--  const rankChart = echarts.init(schoolRankChartRef.value)-->
<!--  rankChart.setOption({-->
<!--    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },-->
<!--    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },-->
<!--    xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },-->
<!--    yAxis: {-->
<!--      type: 'category',-->
<!--      data: ['四川师范', '西南财大', '成都理工', '电子科大', '四川大学', '锦江学院', '天府学院'], // 倒序-->
<!--      axisLabel: { interval: 0 }-->
<!--    },-->
<!--    series: [-->
<!--      {-->
<!--        name: '就业率',-->
<!--        type: 'bar',-->
<!--        data: [78, 82, 85, 92, 94, 95, 96],-->
<!--        itemStyle: {-->
<!--          color: (params: any) => {-->
<!--            // 低于 80% 显示红色，其他显示蓝色-->
<!--            return params.value < 80 ? '#F56C6C' : '#409EFF'-->
<!--          },-->
<!--          borderRadius: [0, 4, 4, 0]-->
<!--        },-->
<!--        label: { show: true, position: 'right', formatter: '{c}%' }-->
<!--      }-->
<!--    ]-->
<!--  })-->

<!--  // 2. 就业结构 (Pie Chart)-->
<!--  const statusChart = echarts.init(statusPieChartRef.value)-->
<!--  statusChart.setOption({-->
<!--    tooltip: { trigger: 'item' },-->
<!--    legend: { bottom: '0%', left: 'center' },-->
<!--    series: [-->
<!--      {-->
<!--        name: '去向类型',-->
<!--        type: 'pie',-->
<!--        radius: ['40%', '70%'],-->
<!--        avoidLabelOverlap: false,-->
<!--        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },-->
<!--        label: { show: false, position: 'center' },-->
<!--        emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },-->
<!--        data: [-->
<!--          { value: 1048, name: '签就业协议' },-->
<!--          { value: 735, name: '签劳动合同' },-->
<!--          { value: 580, name: '升学(考研/博)' },-->
<!--          { value: 484, name: '自主创业' }, // 重点突出-->
<!--          { value: 300, name: '灵活就业' }-->
<!--        ]-->
<!--      }-->
<!--    ]-->
<!--  })-->

<!--  // 3. 薪资分布 (Bar Chart)-->
<!--  const salaryChart = echarts.init(salaryChartRef.value)-->
<!--  salaryChart.setOption({-->
<!--    tooltip: { trigger: 'item' },-->
<!--    xAxis: { type: 'category', data: ['<3k', '3-5k', '5-8k', '8-10k', '>10k'] },-->
<!--    yAxis: { type: 'value' },-->
<!--    series: [{-->
<!--      data: [120, 200, 150, 80, 70],-->
<!--      type: 'bar',-->
<!--      itemStyle: { color: '#85C1E9' }-->
<!--    }]-->
<!--  })-->

<!--  // 4. 创业领域分布 (Rose Chart - 特色)-->
<!--  const startupChart = echarts.init(startupChartRef.value)-->
<!--  startupChart.setOption({-->
<!--    tooltip: { trigger: 'item' },-->
<!--    series: [-->
<!--      {-->
<!--        name: '创业领域',-->
<!--        type: 'pie',-->
<!--        radius: [10, 80],-->
<!--        center: ['50%', '50%'],-->
<!--        roseType: 'area',-->
<!--        itemStyle: { borderRadius: 8 },-->
<!--        data: [-->
<!--          { value: 40, name: '互联网+' },-->
<!--          { value: 38, name: '文化创意' },-->
<!--          { value: 32, name: '现代农业' },-->
<!--          { value: 30, name: '零售电商' },-->
<!--          { value: 28, name: '技术服务' }-->
<!--        ]-->
<!--      }-->
<!--    ]-->
<!--  })-->

<!--  // 响应式大小调整-->
<!--  window.addEventListener('resize', () => {-->
<!--    rankChart.resize(); statusChart.resize(); salaryChart.resize(); startupChart.resize()-->
<!--  })-->
<!--}-->

<!--const handleExportReport = () => {-->
<!--  ElMessage.success('正在生成《2026届全省高校毕业生就业质量年度报告》PDF...')-->
<!--}-->

<!--onMounted(() => {-->
<!--  nextTick(() => {-->
<!--    initCharts()-->
<!--  })-->
<!--})-->
<!--</script>-->

<!--<style scoped>-->
<!--.kpi-card {-->
<!--  border: none;-->
<!--  transition: transform 0.3s;-->
<!--}-->
<!--.kpi-card:hover {-->
<!--  transform: translateY(-5px);-->
<!--}-->
<!--.chart-card {-->
<!--  height: 100%;-->
<!--}-->
<!--</style>-->