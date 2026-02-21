<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-wrapper mb-4">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="职位名称">
          <el-input 
            v-model="queryParams.jobName" 
            placeholder="输入职位名称搜索" 
            clearable 
            style="width: 200px"
            @keyup.enter="handleQuery" 
          />
        </el-form-item>
        
        <el-form-item label="企业名称">
          <el-input 
            v-model="queryParams.companyName" 
            placeholder="输入企业名称搜索" 
            clearable 
            style="width: 200px"
            @keyup.enter="handleQuery" 
          />
        </el-form-item>

        <el-form-item label="审核状态">
          <el-select 
            v-model="queryParams.audit" 
            placeholder="全部状态" 
            clearable 
            style="width: 120px"
          >
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已驳回" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <div class="mb-4 flex items-center text-sm bg-orange-50 p-2 rounded border border-orange-100 text-orange-800">
        <el-icon class="mr-2"><WarningFilled /></el-icon>
        <span>共 {{ total }} 个岗位，其中 {{ pendingCount }} 个待审核</span>
      </div>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column type="index" label="#" width="50" align="center" />

        <el-table-column prop="jobName" label="职位名称" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="font-bold text-gray-800">{{ row.jobName }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ row.salaryRangeLabel }}</div>
          </template>
        </el-table-column>

        <el-table-column label="企业信息" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center">
              <el-image
                style="width: 40px; height: 40px; border-radius: 4px; margin-right: 10px"
                :src="row.companyLogo"
                fit="cover"
              >
                <template #error>
                  <div class="image-slot flex items-center justify-center bg-gray-100 w-full h-full text-gray-400">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div>
                <div class="font-medium text-gray-800">{{ row.companyName }}</div>
                <div class="text-xs text-gray-400">{{ row.companyIndustry }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="city" label="工作地点" width="120" align="center" />

        <el-table-column label="要求" width="150" align="center">
          <template #default="{ row }">
            <div class="text-xs">
              <div>{{ row.educationLabel }}</div>
              <div class="text-gray-400">{{ getExperienceLabel(row.experience) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="标签" width="200">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1">
              <el-tag 
                v-for="tag in (row.tags || '').split(',').filter(t => t).slice(0, 3)" 
                :key="tag" 
                size="small" 
                type="info" 
                effect="plain"
              >
                {{ tag }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="viewCount" label="浏览量" width="100" align="center">
          <template #default="{ row }">
            <span class="font-mono text-gray-600">{{ row.viewCount || 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column label="审核状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.audit === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="row.audit === 1" type="success">已通过</el-tag>
            <el-tag v-else-if="row.audit === 2" type="danger">已驳回</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="招聘状态" width="100" align="center">
          <template #default="{ row }">
            <template v-if="row.audit === 1">
              <el-tag v-if="row.status === 1" type="primary">招聘中</el-tag>
              <el-tag v-else-if="row.status === 0" type="info">已下架</el-tag>
            </template>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="发布时间" width="180" align="center" />

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="View" @click="handleView(row)">详情</el-button>

            <el-button
                v-if="row.audit === 0"
                link
                type="success"
                :icon="Check"
                @click="handleAudit(row, 1)"
            >
              通过
            </el-button>

            <el-button
                v-if="row.audit === 0"
                link
                type="danger"
                :icon="Close"
                @click="handleAudit(row, 2)"
            >
              驳回
            </el-button>

            <el-button
                v-if="row.audit === 1 && row.status === 1"
                link
                type="warning"
                @click="handleOffline(row)"
            >
              下架
            </el-button>

            <el-button
                v-if="row.audit === 1 && row.status === 0"
                link
                type="info"
                disabled
            >
              已下架
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleQuery"
            @current-change="getList"
        />
      </div>
    </el-card>

    <!-- 岗位详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="岗位详情"
      width="800px"
      append-to-body
    >
      <div v-if="currentJob" class="job-detail">
        <!-- 企业信息 -->
        <div class="flex gap-4 mb-4 pb-4 border-b">
          <el-image 
            :src="currentJob.companyLogo" 
            class="w-20 h-20 rounded border bg-white p-1" 
            fit="contain" 
          />
          <div class="flex-1">
            <h3 class="font-bold text-xl text-gray-800 mb-1">{{ currentJob.jobName }}</h3>
            <div class="text-red-600 font-bold text-lg mb-2">{{ currentJob.salaryRangeLabel }}</div>
            <div class="flex gap-2 flex-wrap">
              <el-tag 
                v-for="tag in (currentJob.tags || '').split(',').filter(t => t)" 
                :key="tag" 
                size="small"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
          <div class="text-right">
            <el-tag v-if="currentJob.audit === 0" type="warning" size="large">待审核</el-tag>
            <el-tag v-else-if="currentJob.audit === 1" type="success" size="large">已通过</el-tag>
            <el-tag v-else-if="currentJob.audit === 2" type="danger" size="large">已驳回</el-tag>
          </div>
        </div>

        <!-- 基本信息 -->
        <el-descriptions :column="2" border class="mb-4">
          <el-descriptions-item label="企业名称">{{ currentJob.companyName }}</el-descriptions-item>
          <el-descriptions-item label="所属行业">{{ currentJob.companyIndustry }}</el-descriptions-item>
          <el-descriptions-item label="招聘状态">
            <el-tag v-if="currentJob.status === 1" type="primary" size="small">招聘中</el-tag>
            <el-tag v-else-if="currentJob.status === 0" type="info" size="small">已下架</el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="工作地点">{{ currentJob.city }}</el-descriptions-item>
          <el-descriptions-item label="工作地址">{{ currentJob.location }}</el-descriptions-item>
          <el-descriptions-item label="学历要求">{{ currentJob.educationLabel }}</el-descriptions-item>
          <el-descriptions-item label="经验要求">{{ getExperienceLabel(currentJob.experience) }}</el-descriptions-item>
          <el-descriptions-item label="浏览量">{{ currentJob.viewCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ currentJob.createTime }}</el-descriptions-item>
          <el-descriptions-item label="HR姓名">{{ currentJob.hrName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentJob.contactPhone }}</el-descriptions-item>
        </el-descriptions>

        <!-- 职位描述 -->
        <el-divider content-position="left">职位描述</el-divider>
        <div class="bg-gray-50 p-4 rounded text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {{ currentJob.description || '暂无描述' }}
        </div>

        <!-- 职位要求 -->
        <el-divider content-position="left">任职要求</el-divider>
        <div class="bg-gray-50 p-4 rounded text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {{ currentJob.requirement || '暂无要求' }}
        </div>

        <!-- 驳回原因 -->
        <div v-if="currentJob.audit === 2 && currentJob.reason" class="mt-4">
          <el-divider content-position="left">驳回原因</el-divider>
          <div class="bg-red-50 p-4 rounded text-sm text-red-600">
            {{ currentJob.reason }}
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button 
          v-if="currentJob?.audit === 0" 
          type="danger" 
          @click="handleAudit(currentJob, 2)"
        >
          驳回
        </el-button>
        <el-button 
          v-if="currentJob?.audit === 0" 
          type="success" 
          @click="handleAudit(currentJob, 1)"
        >
          通过审核
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, Refresh, View, Check, Close, Picture, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getJobList, 
  auditJob, 
  offlineJob,
  type JobQuery 
} from '@/api/jobAudit'

// --- State ---
const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const detailVisible = ref(false)
const currentJob = ref<any>(null)

// 查询参数
const queryParams = reactive<JobQuery>({
  pageNum: 1,
  pageSize: 10,
  jobName: '',
  companyName: '',
  audit: null
})

// 计算待审核数量
const pendingCount = computed(() => {
  return tableData.value.filter(item => item.audit === 0).length
})
// --- 工具函数：经验要求格式化 ---
const getExperienceLabel = (exp: string | null) => {
  if (!exp) return '不限经验' // 如果后端传了 null，默认显示为不限经验（或者改为 '-'）

  const map: Record<string, string> = {
    'fresh': '应届生',
    'unlimited': '不限经验'
  }

  // 如果匹配到了就返回中文，匹配不到就返回原字符串
  return map[exp] || exp
}

// --- Methods ---

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getJobList(queryParams)
    tableData.value = res.data?.data || []
    total.value = res.data?.total || 0
  } catch (error) {
    console.error('获取岗位列表失败', error)
    ElMessage.error('获取岗位列表失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const handleReset = () => {
  queryParams.jobName = ''
  queryParams.companyName = ''
  queryParams.audit = null
  handleQuery()
}

// 查看详情
const handleView = (row: any) => {
  currentJob.value = row
  detailVisible.value = true
}

// 审核岗位
const handleAudit = async (row: any, audit: number) => {
  const actionText = audit === 1 ? '通过' : '驳回'
  
  if (audit === 2) {
    // 驳回需要填写原因
    ElMessageBox.prompt('请输入驳回原因', '驳回岗位', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '驳回原因不能为空'
    }).then(async ({ value }) => {
      try {
        await auditJob({ jobId: row.jobId, audit, reason: value })
        ElMessage.success(`已${actionText}`)
        detailVisible.value = false
        getList()
      } catch (error) {
        console.error('审核失败', error)
      }
    }).catch(() => {})
  } else {
    // 通过直接确认
    ElMessageBox.confirm(`确定${actionText}岗位【${row.jobName}】吗？`, '审核确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }).then(async () => {
      try {
        await auditJob({ jobId: row.jobId, audit })
        ElMessage.success(`已${actionText}`)
        detailVisible.value = false
        getList()
      } catch (error) {
        console.error('审核失败', error)
      }
    }).catch(() => {})
  }
}

// 下架岗位
const handleOffline = (row: any) => {
  ElMessageBox.confirm(`确定下架岗位【${row.jobName}】吗？下架后将不再展示给学生。`, '下架岗位', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await offlineJob(row.jobId)
      ElMessage.success('岗位已下架')
      getList()
    } catch (error) {
      console.error('下架失败', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.job-detail {
  .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: #909399;
  }
}
</style>
