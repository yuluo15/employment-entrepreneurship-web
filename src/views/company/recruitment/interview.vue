<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="学生姓名">
          <el-input 
            v-model="queryParams.studentName" 
            placeholder="请输入学生姓名" 
            clearable 
            style="width: 200px" 
          />
        </el-form-item>
        <el-form-item label="面试状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="待面试" value="SCHEDULED" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item label="面试时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="interviewList" style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentPhone" label="联系电话" width="130" />
        <el-table-column prop="jobName" label="应聘职位" min-width="180" show-overflow-tooltip />
        <el-table-column prop="interviewTime" label="面试时间" width="180" align="center" />
        <el-table-column prop="duration" label="时长" width="80" align="center">
          <template #default="{ row }">
            {{ row.duration }}分钟
          </template>
        </el-table-column>
        <el-table-column prop="type" label="面试方式" width="100" align="center">
          <template #default="{ row }">
            {{ getInterviewTypeLabel(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
            <el-button 
              v-if="row.status === 'SCHEDULED'" 
              link 
              type="success" 
              size="small" 
              @click="handleComplete(row)"
            >
              完成面试
            </el-button>
            <el-button 
              v-if="row.status === 'SCHEDULED'" 
              link 
              type="warning" 
              size="small" 
              @click="handleCancel(row)"
            >
              取消面试
            </el-button>
            <el-button 
              v-if="row.status === 'COMPLETED' && !row.interviewScore" 
              link 
              type="primary" 
              size="small" 
              @click="handleEvaluate(row)"
            >
              评价
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </el-card>

    <!-- 面试详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="面试详情" width="700px">
      <div v-if="currentInterview" class="interview-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学生姓名">{{ currentInterview.studentName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentInterview.studentPhone }}</el-descriptions-item>
          <el-descriptions-item label="应聘职位" :span="2">{{ currentInterview.jobName }}</el-descriptions-item>
          <el-descriptions-item label="面试时间">{{ currentInterview.interviewTime }}</el-descriptions-item>
          <el-descriptions-item label="面试时长">{{ currentInterview.duration }}分钟</el-descriptions-item>
          <el-descriptions-item label="面试方式">{{ getInterviewTypeLabel(currentInterview.type) }}</el-descriptions-item>
          <el-descriptions-item label="面试状态">
            <el-tag :type="getStatusTagType(currentInterview.status)" size="small">
              {{ getStatusLabel(currentInterview.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="面试地点/链接" :span="2">
            {{ currentInterview.location }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2" v-if="currentInterview.notes">
            {{ currentInterview.notes }}
          </el-descriptions-item>
          <el-descriptions-item label="面试评分" v-if="currentInterview.interviewScore">
            <el-rate v-model="currentInterview.interviewScore" disabled />
          </el-descriptions-item>
          <el-descriptions-item label="面试评价" :span="2" v-if="currentInterview.interviewComment">
            {{ currentInterview.interviewComment }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 完成面试对话框 -->
    <el-dialog 
      v-model="completeDialogVisible" 
      title="完成面试" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="completeFormRef"
        :model="completeForm"
        :rules="completeRules"
        label-width="100px"
      >
        <el-form-item label="面试结果" prop="result">
          <el-radio-group v-model="completeForm.result">
            <el-radio value="PASS">通过</el-radio>
            <el-radio value="FAIL">不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="面试评分" prop="score">
          <el-rate v-model="completeForm.score" show-text />
        </el-form-item>
        <el-form-item label="面试评价" prop="comment">
          <el-input 
            v-model="completeForm.comment" 
            type="textarea"
            :rows="4"
            placeholder="请输入面试评价"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="completeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmComplete" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 评价对话框 -->
    <el-dialog 
      v-model="evaluateDialogVisible" 
      title="面试评价" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="evaluateFormRef"
        :model="evaluateForm"
        :rules="evaluateRules"
        label-width="100px"
      >
        <el-form-item label="面试评分" prop="score">
          <el-rate v-model="evaluateForm.score" show-text />
        </el-form-item>
        <el-form-item label="面试评价" prop="comment">
          <el-input 
            v-model="evaluateForm.comment" 
            type="textarea"
            :rows="4"
            placeholder="请输入面试评价"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="evaluateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmEvaluate" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import {
  getInterviewList,
  completeInterview,
  cancelInterview,
  evaluateInterview,
  type InterviewQuery,
  type InterviewItem,
  type CompleteForm,
  type EvaluateForm
} from '@/api/recruitment'

// 查询参数
const queryParams = reactive<InterviewQuery>({
  pageNum: 1,
  pageSize: 10,
  studentName: '',
  status: ''
})

const dateRange = ref<string[]>([])

// 列表数据
const loading = ref(false)
const interviewList = ref<InterviewItem[]>([])
const total = ref(0)

// 详情
const detailDialogVisible = ref(false)
const currentInterview = ref<InterviewItem | null>(null)

// 完成面试
const completeDialogVisible = ref(false)
const completeFormRef = ref<FormInstance>()
const submitting = ref(false)
const completeForm = reactive<CompleteForm>({
  interviewId: '',
  result: 'PASS',
  score: 5,
  comment: ''
})

const completeRules = {
  result: [
    { required: true, message: '请选择面试结果', trigger: 'change' }
  ],
  score: [
    { required: true, message: '请选择面试评分', trigger: 'change' }
  ],
  comment: [
    { required: true, message: '请输入面试评价', trigger: 'blur' }
  ]
}

// 评价
const evaluateDialogVisible = ref(false)
const evaluateFormRef = ref<FormInstance>()
const evaluateForm = reactive<EvaluateForm>({
  interviewId: '',
  score: 5,
  comment: ''
})

const evaluateRules = {
  score: [
    { required: true, message: '请选择面试评分', trigger: 'change' }
  ],
  comment: [
    { required: true, message: '请输入面试评价', trigger: 'blur' }
  ]
}

// 加载列表
const loadList = async () => {
  loading.value = true
  try {
    // 处理日期范围
    if (dateRange.value && dateRange.value.length === 2) {
      queryParams.startDate = dateRange.value[0]
      queryParams.endDate = dateRange.value[1]
    } else {
      queryParams.startDate = undefined
      queryParams.endDate = undefined
    }

    const res = await getInterviewList(queryParams)
    interviewList.value = res.data.data || []
    total.value = res.data.total
  } catch (error) {
    console.error('加载列表失败', error)
    ElMessage.error('加载列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  loadList()
}

// 重置
const handleReset = () => {
  queryParams.studentName = ''
  queryParams.status = ''
  dateRange.value = []
  handleQuery()
}

// 查看详情
const handleViewDetail = (row: InterviewItem) => {
  currentInterview.value = row
  detailDialogVisible.value = true
}

// 完成面试
const handleComplete = (row: InterviewItem) => {
  completeForm.interviewId = row.id
  completeForm.result = 'PASS'
  completeForm.score = 5
  completeForm.comment = ''
  completeDialogVisible.value = true
}

// 确认完成面试
const handleConfirmComplete = async () => {
  if (!completeFormRef.value) return
  
  await completeFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      await completeInterview(completeForm)
      ElMessage.success('操作成功')
      completeDialogVisible.value = false
      loadList()
    } catch (error) {
      console.error('操作失败', error)
      ElMessage.error('操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 取消面试
const handleCancel = async (row: InterviewItem) => {
  try {
    const result = await ElMessageBox.prompt('请输入取消原因', '取消面试', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入取消原因',
      inputValidator: (value) => {
        if (!value) {
          return '请输入取消原因'
        }
        return true
      }
    })
    
    await cancelInterview(row.id, result.value)
    ElMessage.success('操作成功')
    loadList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败', error)
      ElMessage.error('操作失败')
    }
  }
}

// 评价
const handleEvaluate = (row: InterviewItem) => {
  evaluateForm.interviewId = row.id
  evaluateForm.score = 5
  evaluateForm.comment = ''
  evaluateDialogVisible.value = true
}

// 确认评价
const handleConfirmEvaluate = async () => {
  if (!evaluateFormRef.value) return
  
  await evaluateFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      await evaluateInterview(evaluateForm)
      ElMessage.success('评价成功')
      evaluateDialogVisible.value = false
      loadList()
    } catch (error) {
      console.error('评价失败', error)
      ElMessage.error('评价失败')
    } finally {
      submitting.value = false
    }
  })
}

// 工具函数
const getInterviewTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    'ONSITE': '现场面试',
    'VIDEO': '视频面试',
    'PHONE': '电话面试'
  }
  return map[type] || type
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    'SCHEDULED': '待面试',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return map[status] || status
}

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    'SCHEDULED': 'warning',
    'COMPLETED': 'success',
    'CANCELLED': 'info'
  }
  return map[status] || ''
}

onMounted(() => {
  loadList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.interview-detail {
  padding: 10px 0;
}
</style>
