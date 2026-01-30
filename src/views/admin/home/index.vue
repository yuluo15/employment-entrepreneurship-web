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

    <el-row :gutter="20" class="mb-4">
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
          <div class="mt-3 text-xs text-gray-400 flex justify-between">
            <span>{{ item.subTitle }}</span>
            <span :class="item.isUp ? 'text-red-500' : 'text-green-500'" class="font-bold">
              {{ item.isUp ? '+' : '' }}{{ item.growth }}%
              <el-icon><component :is="item.isUp ? 'CaretTop' : 'CaretBottom'" /></el-icon>
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mb-4">

      <el-col :xs="24" :lg="16" class="mb-4">
        <el-card shadow="never" class="h-full">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">全平台业务趋势分析</span>
              <el-radio-group v-model="chartTime" size="small">
                <el-radio-button label="week">近7日</el-radio-button>
                <el-radio-button label="month">近30日</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <el-row :gutter="20">
            <el-col :span="10">
              <div class="chart-title">学生创业领域占比</div>
              <div ref="pieChartRef" style="height: 300px;"></div>
            </el-col>

            <el-col :span="14">
              <div class="chart-title">就业供需趋势 (简历 vs 岗位)</div>
              <div ref="lineChartRef" style="height: 300px;"></div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8" class="mb-4">
        <el-card shadow="never" class="h-full">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">待处理审批</span>
              <el-badge :value="todoList.length" type="danger" />
            </div>
          </template>
          <div class="todo-list">
            <div v-for="(task, i) in todoList" :key="i" class="todo-item">
              <div class="flex items-start">
                <el-tag :type="task.typeTag" size="small" class="mr-3 mt-0.5">{{ task.typeName }}</el-tag>
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-800 mb-1">{{ task.title }}</div>
                  <div class="text-xs text-gray-400">{{ task.time }} · {{ task.submitter }}</div>
                </div>
              </div>
              <el-button link type="primary" size="small" @click="handleProcess(task)">处理</el-button>
            </div>
            <div v-if="todoList.length === 0" class="text-center text-gray-400 py-10">
              暂无待办事项
            </div>
          </div>
          <div class="text-center mt-4 pt-4 border-t border-gray-100">
            <el-button link type="info" size="small">查看全部消息</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold">最新入驻企业一览</span>
          <el-button link type="primary" @click="router.push('/admin/system/companyManage')">管理企业</el-button>
        </div>
      </template>
      <el-table :data="latestCompanies" style="width: 100%" size="small">
        <el-table-column prop="name" label="企业名称" min-width="200" />
        <el-table-column prop="industry" label="所属行业" width="150" />
        <el-table-column prop="jobs" label="发布岗位" width="100" align="center">
          <template #default="{ row }"><span class="text-blue-500 font-bold">{{ row.jobs }}</span></template>
        </el-table-column>
        <el-table-column prop="date" label="入驻时间" width="180" align="right" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  DataBoard, School, OfficeBuilding, User,
  CaretTop, CaretBottom, DocumentCopy
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()
const currentDate = computed(() => dayjs().format('YYYY年MM月DD日 dddd'))
const chartTime = ref('week')

// --- 1. 核心指标数据 (业务导向) ---
const statCards = [
  {
    title: '入驻学校',
    value: '12',
    subTitle: '覆盖省份: 5',
    growth: '4.5',
    isUp: true,
    icon: School,
    bgColor: '#ecf5ff',
    iconColor: '#409eff'
  },
  {
    title: '入驻企业',
    value: '843',
    subTitle: '岗位充足度: 高',
    growth: '12.0',
    isUp: true,
    icon: OfficeBuilding,
    bgColor: '#fdf6ec',
    iconColor: '#e6a23c'
  },
  {
    title: '学生总数',
    value: '45,201',
    subTitle: '就业率: 92%',
    growth: '1.2',
    isUp: false, // 模拟增长变缓
    icon: User,
    bgColor: '#f0f9eb',
    iconColor: '#67c23a'
  },
  {
    title: '今日简历投递', // 【修改点】: 替换了 API 调用
    value: '3,421',
    subTitle: '较昨日',
    growth: '24.1',
    isUp: true,
    icon: DocumentCopy,
    bgColor: '#fef0f0',
    iconColor: '#f56c6c'
  },
]

// --- 2. 待办事项 (增加跳转处理) ---
const todoList = ref([
  { id: 1, title: '申请入驻：四川大学锦江学院', time: '10分钟前', submitter: '教务处', typeName: '学校', typeTag: 'primary', path: '/admin/system/schoolManage' },
  { id: 2, title: '资质审核：成都高新科技有限公司', time: '1小时前', submitter: '企业HR', typeName: '企业', typeTag: 'warning', path: '/admin/system/companyManage' },
  { id: 3, title: '创业扶持申请：无人机物流项目', time: '2小时前', submitter: '李同学', typeName: '创业', typeTag: 'success', path: '/admin/system/stuEntManage' },
])

const handleProcess = (task: any) => {
  console.log('跳转处理任务', task)
  router.push(task.path)
}

// --- 3. 底部表格数据 (最新入驻) ---
const latestCompanies = [
  { name: '字节跳动 (ByteDance)', industry: '互联网/IT', jobs: 120, date: '2025-12-29 10:00' },
  { name: '华为技术有限公司', industry: '通信/硬件', jobs: 85, date: '2025-12-28 14:30' },
  { name: '小米科技', industry: '智能家居', jobs: 45, date: '2025-12-27 09:15' },
]

// --- 4. 图表逻辑 (左右双图) ---
const pieChartRef = ref()
const lineChartRef = ref()
let pieChart: any = null
let lineChart: any = null

const initCharts = () => {
  // 左边：饼图 (创业领域)
  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
    pieChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '0%', left: 'center', itemWidth: 10, itemHeight: 10 },
      color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399'],
      series: [
        {
          name: '创业领域',
          type: 'pie',
          radius: ['40%', '60%'],
          center: ['50%', '40%'],
          avoidLabelOverlap: false,
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: '14', fontWeight: 'bold' }
          },
          data: [
            { value: 1048, name: '互联网+' },
            { value: 735, name: '文化创意' },
            { value: 580, name: '现代农业' },
            { value: 484, name: '社会服务' },
            { value: 300, name: '其他' }
          ]
        }
      ]
    })
  }

  // 右边：折线图 (就业趋势)
  if (lineChartRef.value) {
    lineChart = echarts.init(lineChartRef.value)
    lineChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['简历投递', '新增岗位'], top: 0 },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
      yAxis: { type: 'value' },
      series: [
        {
          name: '简历投递',
          type: 'line',
          smooth: true,
          data: [1200, 1320, 1010, 1340, 2900, 2300, 2100],
          itemStyle: { color: '#409eff' },
          areaStyle: { opacity: 0.1, color: '#409eff' }
        },
        {
          name: '新增岗位',
          type: 'line',
          smooth: true,
          data: [220, 182, 191, 234, 290, 330, 310],
          itemStyle: { color: '#67c23a' } // 绿色代表企业
        }
      ]
    })
  }
}

const resizeCharts = () => {
  pieChart?.resize()
  lineChart?.resize()
}

onMounted(() => {
  nextTick(() => {
    initCharts()
    window.addEventListener('resize', resizeCharts)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  pieChart?.dispose()
  lineChart?.dispose()
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