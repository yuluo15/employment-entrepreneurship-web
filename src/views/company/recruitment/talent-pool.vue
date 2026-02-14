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
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="已录用" value="OFFER" />
            <el-option label="已拒绝" value="REJECTED" />
          </el-select>
        </el-form-item>
        <el-form-item label="职位名称">
          <el-select 
            v-model="queryParams.jobId" 
            placeholder="请选择职位" 
            clearable 
            filterable
            style="width: 200px"
          >
            <el-option 
              v-for="job in jobOptions" 
              :key="job.id" 
              :label="job.jobName" 
              :value="job.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon offer-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.offerCount }}</div>
              <div class="stat-label">已录用</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon rejected-icon">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.rejectedCount }}</div>
              <div class="stat-label">已拒绝</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total-icon">
              <el-icon><DataLine /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalCount }}</div>
              <div class="stat-label">总计</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 列表 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="talentList" style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentPhone" label="联系电话" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" show-overflow-tooltip />
        <el-table-column prop="jobName" label="应聘职位" min-width="180" show-overflow-tooltip />
        <el-table-column prop="school" label="学校" width="150" show-overflow-tooltip />
        <el-table-column prop="major" label="专业" width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'OFFER' ? 'success' : 'info'" size="small">
              {{ row.status === 'OFFER' ? '已录用' : '已拒绝' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewResume(row)">
              查看简历
            </el-button>
            <el-button 
              v-if="row.status === 'REJECTED'" 
              link 
              type="success" 
              size="small" 
              @click="handleOffer(row)"
            >
              发放Offer
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

    <!-- 简历详情对话框 -->
    <el-dialog v-model="resumeDialogVisible" title="简历详情" width="900px">
      <div v-if="currentResume" class="resume-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3 class="section-title">基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">{{ currentResume.studentName }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ currentResume.gender === 1 ? '男' : '女' }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ currentResume.studentPhone }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ currentResume.email }}</el-descriptions-item>
            <el-descriptions-item label="学校">{{ currentResume.school }}</el-descriptions-item>
            <el-descriptions-item label="专业">{{ currentResume.major }}</el-descriptions-item>
            <el-descriptions-item label="学历">{{ getEducationLabel(currentResume.education) }}</el-descriptions-item>
            <el-descriptions-item label="毕业年份">{{ currentResume.graduationYear }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 求职意向 -->
        <div class="detail-section" v-if="currentResume.jobIntention">
          <h3 class="section-title">求职意向</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="期望职位">{{ currentResume.jobIntention }}</el-descriptions-item>
            <el-descriptions-item label="期望薪资">{{ currentResume.expectedSalary }}</el-descriptions-item>
            <el-descriptions-item label="期望城市" :span="2">{{ currentResume.expectedCity }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 教育经历 -->
        <div class="detail-section" v-if="currentResume.educationList && currentResume.educationList.length">
          <h3 class="section-title">教育经历</h3>
          <div v-for="(edu, index) in currentResume.educationList" :key="index" class="content-box mb-3">
            <div class="flex justify-between mb-2">
              <span class="font-bold">{{ edu.school }}</span>
              <span class="text-gray-500">{{ edu.startDate }} - {{ edu.endDate }}</span>
            </div>
            <div class="text-gray-600">{{ edu.major }} | {{ getEducationLabel(edu.education) }}</div>
          </div>
        </div>

        <!-- 实习经历 -->
        <div class="detail-section" v-if="currentResume.experienceList && currentResume.experienceList.length">
          <h3 class="section-title">实习/项目经历</h3>
          <div v-for="(exp, index) in currentResume.experienceList" :key="index" class="content-box mb-3">
            <div class="flex justify-between mb-2">
              <span class="font-bold">{{ exp.company }}</span>
              <span class="text-gray-500">{{ exp.startDate }} - {{ exp.endDate }}</span>
            </div>
            <div class="text-gray-600 mb-2">{{ exp.position }}</div>
            <div class="text-gray-700" style="white-space: pre-wrap">{{ exp.description }}</div>
          </div>
        </div>

        <!-- 技能特长 -->
        <div class="detail-section" v-if="currentResume.skills">
          <h3 class="section-title">技能特长</h3>
          <div class="content-box">{{ currentResume.skills }}</div>
        </div>

        <!-- 自我评价 -->
        <div class="detail-section" v-if="currentResume.selfEvaluation">
          <h3 class="section-title">自我评价</h3>
          <div class="content-box">{{ currentResume.selfEvaluation }}</div>
        </div>
      </div>
    </el-dialog>

    <!-- 发放Offer对话框 -->
    <el-dialog 
      v-model="offerDialogVisible" 
      title="发放Offer" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="offerFormRef"
        :model="offerForm"
        :rules="offerRules"
        label-width="100px"
      >
        <el-form-item label="入职时间" prop="entryDate">
          <el-date-picker
            v-model="offerForm.entryDate"
            type="date"
            placeholder="选择入职时间"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="薪资待遇" prop="salary">
          <el-input 
            v-model="offerForm.salary" 
            placeholder="请输入薪资待遇，如：8000-10000"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="offerForm.notes" 
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（选填）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="offerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmOffer" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { Search, Refresh, UserFilled, CircleClose, DataLine } from '@element-plus/icons-vue'
import {
  getTalentPoolList,
  getTalentStatistics,
  sendOffer,
  getResumeDetail,
  getCompanyJobs,
  type TalentQuery,
  type TalentItem,
  type TalentStatistics,
  type OfferForm,
  type ResumeDetail,
  type JobOption
} from '@/api/recruitment'

// 查询参数
const queryParams = reactive<TalentQuery>({
  pageNum: 1,
  pageSize: 10,
  studentName: '',
  status: '',
  jobId: ''
})

// 列表数据
const loading = ref(false)
const talentList = ref<TalentItem[]>([])
const total = ref(0)

// 统计数据
const statistics = ref<TalentStatistics>({
  offerCount: 0,
  rejectedCount: 0,
  totalCount: 0
})

// 职位选项
const jobOptions = ref<JobOption[]>([])

// 简历详情
const resumeDialogVisible = ref(false)
const currentResume = ref<ResumeDetail | null>(null)

// 发放Offer
const offerDialogVisible = ref(false)
const offerFormRef = ref<FormInstance>()
const submitting = ref(false)
const offerForm = reactive<OfferForm>({
  deliveryId: '',
  entryDate: '',
  salary: '',
  notes: ''
})

const offerRules = {
  entryDate: [
    { required: true, message: '请选择入职时间', trigger: 'change' }
  ],
  salary: [
    { required: true, message: '请输入薪资待遇', trigger: 'blur' }
  ]
}

// 加载职位选项
const loadJobOptions = async () => {
  try {
    const res = await getCompanyJobs()
    jobOptions.value = res.data || []
  } catch (error) {
    console.error('加载职位列表失败', error)
  }
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await getTalentStatistics()
    statistics.value = res.data
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

// 加载列表
const loadList = async () => {
  loading.value = true
  try {
    const res = await getTalentPoolList(queryParams)
    talentList.value = res.data.data || []
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
  queryParams.jobId = ''
  handleQuery()
}

// 查看简历
const handleViewResume = async (row: TalentItem) => {
  try {
    const res = await getResumeDetail(row.resumeId)
    currentResume.value = res.data
    resumeDialogVisible.value = true
  } catch (error) {
    console.error('加载简历详情失败', error)
    ElMessage.error('加载简历详情失败')
  }
}

// 发放Offer
const handleOffer = (row: TalentItem) => {
  offerForm.deliveryId = row.id
  offerForm.entryDate = ''
  offerForm.salary = ''
  offerForm.notes = ''
  offerDialogVisible.value = true
}

// 确认发放Offer
const handleConfirmOffer = async () => {
  if (!offerFormRef.value) return
  
  await offerFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      await sendOffer(offerForm)
      ElMessage.success('Offer发放成功，已通知学生')
      offerDialogVisible.value = false
      loadList()
      loadStatistics()
    } catch (error) {
      console.error('操作失败', error)
      ElMessage.error('操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 工具函数
const getEducationLabel = (education: string) => {
  const map: Record<string, string> = {
    'college': '大专',
    'bachelor': '本科',
    'master': '硕士',
    'doctor': '博士'
  }
  return map[education] || education
}

onMounted(() => {
  loadJobOptions()
  loadStatistics()
  loadList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    padding: 10px 0;

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-right: 20px;

      &.offer-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      &.rejected-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
      }

      &.total-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
      }
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }
}

.resume-detail {
  .detail-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #409eff;
    }

    .content-box {
      padding: 16px;
      background-color: #f5f7fa;
      border-radius: 4px;
      line-height: 1.8;
      color: #606266;
      white-space: pre-wrap;
    }
  }
}
</style>
