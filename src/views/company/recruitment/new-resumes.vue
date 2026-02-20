<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" :model="queryParams">
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
        <el-form-item label="学生姓名">
          <el-input 
            v-model="queryParams.studentName" 
            placeholder="请输入学生姓名" 
            clearable 
            style="width: 200px" 
          />
        </el-form-item>
        <el-form-item label="投递时间">
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
          <el-button 
            type="success" 
            :icon="MagicStick" 
            @click="handleAIScreen"
            :disabled="!queryParams.jobId"
          >
            AI智能筛选
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="deliveryList" style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentPhone" label="联系电话" width="130" />
        <el-table-column prop="jobName" label="应聘职位" min-width="180" show-overflow-tooltip />
        <el-table-column prop="education" label="学历" width="100" align="center">
          <template #default="{ row }">
            {{ getEducationLabel(row.education) }}
          </template>
        </el-table-column>
        <el-table-column prop="school" label="学校" width="150" show-overflow-tooltip />
        <el-table-column prop="major" label="专业" width="150" show-overflow-tooltip />
        <el-table-column prop="graduationYear" label="毕业年份" width="100" align="center" />
        <el-table-column prop="deliveryTime" label="投递时间" width="180" align="center" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewResume(row)">
              查看简历
            </el-button>
            <el-button link type="success" size="small" @click="handleArrangeInterview(row)">
              安排面试
            </el-button>
            <el-button link type="danger" size="small" @click="handleReject(row)">
              不合适
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
      <div v-if="currentResume" class="resume-wrapper">
        <div class="header-card">
          <div class="name-box">
            <span class="name">{{ currentResume.studentName || '未填写姓名' }}</span>
            <el-tag size="small" :type="currentResume.gender === 1 ? 'primary' : 'danger'" effect="plain" class="ml-2">
              {{ currentResume.gender === 1 ? '男' : '女' }}
            </el-tag>
          </div>
          <div class="basic-info">
            <span class="info-item"><el-icon><Phone /></el-icon> {{ currentResume.studentPhone || '暂无电话' }}</span>
            <span class="info-item"><el-icon><Message /></el-icon> {{ currentResume.email || '暂无邮箱' }}</span>
            <span class="info-item"><el-icon><School /></el-icon> {{ currentResume.school || '未知学校' }}</span>
            <span class="info-item"><el-icon><Reading /></el-icon> {{ currentResume.major || '未知专业' }}</span>
            <span class="info-item"><el-icon><Medal /></el-icon> {{ getEducationLabel(currentResume.education) }}</span>
            <span class="info-item"><el-icon><Calendar /></el-icon> {{ currentResume.graduationYear }}届</span>
          </div>
        </div>

        <div class="section-card" v-if="currentResume.expectedPosition">
          <div class="section-title"><div class="title-line"></div>求职意向</div>
          <div class="intention-grid">
            <div class="int-item"><span class="label">期望职位：</span><span class="val font-bold text-gray-800">{{ currentResume.expectedPosition }}</span></div>
            <div class="int-item"><span class="label">工作性质：</span><span class="val">{{ getJobTypeLabel(currentResume.jobType) }}</span></div>
            <div class="int-item"><span class="label">期望城市：</span><span class="val">{{ currentResume.targetCity }}</span></div>
            <div class="int-item"><span class="label">期望薪资：</span><span class="val text-orange-500 font-bold">{{ currentResume.expectedSalary }}</span></div>
            <div class="int-item"><span class="label">到岗时间：</span><span class="val">{{ currentResume.arrivalTime }}</span></div>
          </div>
        </div>

        <div class="section-card" v-if="currentResume.personalSummary || currentResume.skills">
          <div class="section-title"><div class="title-line"></div>专业技能 & 个人优势</div>
          <div class="skills-box mb-3" v-if="currentResume.skills">
            <el-tag
                v-for="(skill, idx) in currentResume.skills.split(/[,，\s]+/).filter(Boolean)"
                :key="idx"
                class="mr-2 mb-2"
                effect="light"
            >
              {{ skill }}
            </el-tag>
          </div>
          <div class="summary-text" v-if="currentResume.personalSummary">
            {{ currentResume.personalSummary }}
          </div>
        </div>

        <div class="section-card" v-if="currentResume.internshipExp && currentResume.internshipExp.length">
          <div class="section-title"><div class="title-line"></div>实习经历</div>
          <el-timeline>
            <el-timeline-item
                v-for="(exp, index) in currentResume.internshipExp"
                :key="index"
                :timestamp="`${exp.startDate} 至 ${exp.endDate || '至今'}`"
                placement="top"
                type="primary"
            >
              <el-card shadow="hover" class="timeline-card">
                <div class="card-header">
                  <h4 class="company-name">{{ exp.company }}</h4>
                  <el-tag size="small">{{ exp.role }}</el-tag>
                </div>
                <div class="desc-text">{{ exp.description }}</div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="section-card" v-if="currentResume.projectExp && currentResume.projectExp.length">
          <div class="section-title"><div class="title-line"></div>项目经历</div>
          <el-timeline>
            <el-timeline-item
                v-for="(proj, index) in currentResume.projectExp"
                :key="index"
                :timestamp="`${proj.startDate} 至 ${proj.endDate || '至今'}`"
                placement="top"
                type="success"
            >
              <el-card shadow="hover" class="timeline-card">
                <div class="card-header">
                  <h4 class="company-name">
                    {{ proj.projectName }}
                    <a v-if="proj.projectLink" :href="proj.projectLink" target="_blank" class="project-link">
                      <el-icon><Link /></el-icon> 项目链接
                    </a>
                  </h4>
                  <el-tag size="small" type="warning">{{ proj.role }}</el-tag>
                </div>
                <div class="desc-text">{{ proj.description }}</div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="section-card" v-if="currentResume.educationHistory && currentResume.educationHistory.length">
          <div class="section-title"><div class="title-line"></div>教育经历</div>
          <el-timeline>
            <el-timeline-item
                v-for="(edu, index) in currentResume.educationHistory"
                :key="index"
                :timestamp="`${edu.startDate} 至 ${edu.endDate || '至今'}`"
                placement="top"
                type="info"
            >
              <div class="edu-item">
                <span class="school-name">{{ edu.school }}</span>
                <span class="major-name">{{ edu.major }} | {{ edu.degree || getEducationLabel(currentResume.education) }}</span>
              </div>
              <div v-if="edu.description" class="text-sm text-gray-500 mt-1">{{ edu.description }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
<!--      <div v-if="currentResume" class="resume-detail">-->
<!--        &lt;!&ndash; 基本信息 &ndash;&gt;-->
<!--        <div class="detail-section">-->
<!--          <h3 class="section-title">基本信息</h3>-->
<!--          <el-descriptions :column="2" border>-->
<!--            <el-descriptions-item label="姓名">{{ currentResume.studentName }}</el-descriptions-item>-->
<!--            <el-descriptions-item label="性别">{{ currentResume.gender === 1 ? '男' : '女' }}</el-descriptions-item>-->
<!--            <el-descriptions-item label="联系电话">{{ currentResume.studentPhone }}</el-descriptions-item>-->
<!--            <el-descriptions-item label="邮箱">{{ currentResume.email }}</el-descriptions-item>-->
<!--            <el-descriptions-item label="学校">{{ currentResume.school }}</el-descriptions-item>-->
<!--            <el-descriptions-item label="专业">{{ currentResume.major }}</el-descriptions-item>-->
<!--            <el-descriptions-item label="学历">{{ getEducationLabel(currentResume.education) }}</el-descriptions-item>-->
<!--            <el-descriptions-item label="毕业年份">{{ currentResume.graduationYear }}</el-descriptions-item>-->
<!--          </el-descriptions>-->
<!--        </div>-->

<!--        &lt;!&ndash; 求职意向 &ndash;&gt;-->
<!--        <div class="detail-section" v-if="currentResume.jobIntention">-->
<!--          <h3 class="section-title">求职意向</h3>-->
<!--          <el-descriptions :column="2" border>-->
<!--            <el-descriptions-item label="期望职位">{{ currentResume.jobIntention }}</el-descriptions-item>-->
<!--            <el-descriptions-item label="期望薪资">{{ currentResume.expectedSalary }}</el-descriptions-item>-->
<!--            <el-descriptions-item label="期望城市" :span="2">{{ currentResume.expectedCity }}</el-descriptions-item>-->
<!--          </el-descriptions>-->
<!--        </div>-->

<!--        &lt;!&ndash; 教育经历 &ndash;&gt;-->
<!--        <div class="detail-section" v-if="currentResume.educationList && currentResume.educationList.length">-->
<!--          <h3 class="section-title">教育经历</h3>-->
<!--          <div v-for="(edu, index) in currentResume.educationList" :key="index" class="content-box mb-3">-->
<!--            <div class="flex justify-between mb-2">-->
<!--              <span class="font-bold">{{ edu.school }}</span>-->
<!--              <span class="text-gray-500">{{ edu.startDate }} - {{ edu.endDate }}</span>-->
<!--            </div>-->
<!--            <div class="text-gray-600">{{ edu.major }} | {{ getEducationLabel(edu.education) }}</div>-->
<!--          </div>-->
<!--        </div>-->

<!--        &lt;!&ndash; 实习经历 &ndash;&gt;-->
<!--        <div class="detail-section" v-if="currentResume.experienceList && currentResume.experienceList.length">-->
<!--          <h3 class="section-title">实习/项目经历</h3>-->
<!--          <div v-for="(exp, index) in currentResume.experienceList" :key="index" class="content-box mb-3">-->
<!--            <div class="flex justify-between mb-2">-->
<!--              <span class="font-bold">{{ exp.company }}</span>-->
<!--              <span class="text-gray-500">{{ exp.startDate }} - {{ exp.endDate }}</span>-->
<!--            </div>-->
<!--            <div class="text-gray-600 mb-2">{{ exp.position }}</div>-->
<!--            <div class="text-gray-700" style="white-space: pre-wrap">{{ exp.description }}</div>-->
<!--          </div>-->
<!--        </div>-->

<!--        &lt;!&ndash; 技能特长 &ndash;&gt;-->
<!--        <div class="detail-section" v-if="currentResume.skills">-->
<!--          <h3 class="section-title">技能特长</h3>-->
<!--          <div class="content-box">{{ currentResume.skills }}</div>-->
<!--        </div>-->

<!--        &lt;!&ndash; 自我评价 &ndash;&gt;-->
<!--        <div class="detail-section" v-if="currentResume.selfEvaluation">-->
<!--          <h3 class="section-title">自我评价</h3>-->
<!--          <div class="content-box">{{ currentResume.selfEvaluation }}</div>-->
<!--        </div>-->
<!--      </div>-->
    </el-dialog>

    <!-- 安排面试对话框 -->
    <el-dialog 
      v-model="interviewDialogVisible" 
      title="安排面试" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="interviewFormRef"
        :model="interviewForm"
        :rules="interviewRules"
        label-width="100px"
      >
        <el-form-item label="面试时间" prop="interviewTime">
          <el-date-picker
            v-model="interviewForm.interviewTime"
            type="datetime"
            placeholder="选择面试时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="面试时长" prop="duration">
          <el-input-number 
            v-model="interviewForm.duration" 
            :min="15" 
            :max="240" 
            :step="15"
            style="width: 100%"
          />
          <span class="ml-2 text-gray-500">分钟</span>
        </el-form-item>
        <el-form-item label="面试方式" prop="type">
          <el-select v-model="interviewForm.type" placeholder="请选择面试方式" style="width: 100%">
            <el-option label="现场面试" :value="1" />
            <el-option label="视频面试" :value="2" />
            <el-option label="电话面试" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="面试地点" prop="location" v-if="interviewForm.type === 1">
          <el-input
              v-model="interviewForm.location"
              type="textarea"
              :rows="2"
              placeholder="请输入面试地点"
          />
        </el-form-item>
        <el-form-item label="面试链接" prop="location" v-if="interviewForm.type === 2">
          <el-input
              v-model="interviewForm.location"
              placeholder="请输入视频会议链接"
          />
        </el-form-item>
<!--        <el-form-item label="面试方式" prop="type">-->
<!--          <el-select v-model="interviewForm.type" placeholder="请选择面试方式" style="width: 100%">-->
<!--            <el-option label="现场面试" value="ONSITE" />-->
<!--            <el-option label="视频面试" value="VIDEO" />-->
<!--            <el-option label="电话面试" value="PHONE" />-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="面试地点" prop="location" v-if="interviewForm.type === 'ONSITE'">-->
<!--          <el-input -->
<!--            v-model="interviewForm.location" -->
<!--            type="textarea"-->
<!--            :rows="2"-->
<!--            placeholder="请输入面试地点"-->
<!--          />-->
<!--        </el-form-item>-->
<!--        <el-form-item label="面试链接" prop="location" v-if="interviewForm.type === 'VIDEO'">-->
<!--          <el-input -->
<!--            v-model="interviewForm.location" -->
<!--            placeholder="请输入视频会议链接"-->
<!--          />-->
<!--        </el-form-item>-->
        <el-form-item label="备注">
          <el-input 
            v-model="interviewForm.notes" 
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（选填）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="interviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmInterview" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- AI筛选结果对话框 -->
    <el-dialog 
      v-model="aiScreenDialogVisible" 
      title="AI智能筛选结果" 
      width="1200px"
      :close-on-click-modal="false"
    >
      <el-alert
        title="AI已为您筛选出最匹配的候选人"
        type="success"
        :closable="false"
        class="mb-4"
      >
        <template #default>
          <div class="text-sm">
            根据职位要求和候选人简历的语义相似度分析，按匹配度从高到低排序
          </div>
        </template>
      </el-alert>

      <el-table 
        v-loading="aiScreenLoading" 
        :data="aiScreenResults" 
        style="width: 100%"
        max-height="500"
      >
        <el-table-column type="index" label="排名" width="60" align="center" />
        
        <el-table-column label="匹配度" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getMatchScoreType(row.matchScore)" size="large" effect="dark">
              🎯 {{ row.matchScore }}%
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="studentName" label="姓名" width="100" />
        
        <el-table-column label="基本信息" min-width="200">
          <template #default="{ row }">
            <div class="text-sm">
              <div class="mb-1">{{ row.school }} | {{ row.major }}</div>
              <div class="text-gray-500">{{ getEducationLabel(row.education) }} | {{ row.graduationYear }}届</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="求职意向" min-width="180">
          <template #default="{ row }">
            <div class="text-sm">
              <div class="mb-1">{{ row.expectedPosition }}</div>
              <div class="text-gray-500">{{ row.expectedSalary }} | {{ row.targetCity }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="skills" label="技能" min-width="200" show-overflow-tooltip />

        <el-table-column label="匹配理由" min-width="180">
          <template #default="{ row }">
            <div class="text-sm text-blue-600">
              <el-icon class="mr-1"><InfoFilled /></el-icon>
              {{ row.matchReason }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="联系方式" width="180">
          <template #default="{ row }">
            <div class="text-sm">
              <div class="mb-1">📱 {{ row.phone }}</div>
              <div class="text-gray-500">📧 {{ row.email }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewAIResume(row.resumeId)">
              查看简历
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="aiScreenDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="aiScreenDialogVisible = false">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { Search, Refresh, MagicStick, InfoFilled, Phone, Message, School, Reading, Medal, Calendar, Link } from '@element-plus/icons-vue'
import {
  getDeliveryList,
  getResumeDetail,
  arrangeInterview,
  rejectDelivery,
  getCompanyJobs,
  type DeliveryQuery,
  type DeliveryItem,
  type ResumeDetail,
  type InterviewForm,
  type JobOption
} from '@/api/recruitment'
import { screenResumes, type ResumeMatchVO } from '@/api/company/ai'

// 查询参数
const queryParams = reactive<DeliveryQuery>({
  pageNum: 1,
  pageSize: 10,
  jobId: '',
  studentName: ''
})

const dateRange = ref<string[]>([])

// 列表数据
const loading = ref(false)
const deliveryList = ref<DeliveryItem[]>([])
const total = ref(0)

// 职位选项
const jobOptions = ref<JobOption[]>([])

// 简历详情
const resumeDialogVisible = ref(false)
const currentResume = ref<ResumeDetail | null>(null)

// 面试安排
const interviewDialogVisible = ref(false)
const interviewFormRef = ref<FormInstance>()
const submitting = ref(false)
const interviewForm = reactive<InterviewForm>({
  deliveryId: '',
  interviewTime: '',
  duration: 60,
  type: 1,
  location: '',
  notes: ''
})

const interviewRules = {
  interviewTime: [
    { required: true, message: '请选择面试时间', trigger: 'change' }
  ],
  duration: [
    { required: true, message: '请输入面试时长', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择面试方式', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请输入面试地点或链接', trigger: 'blur' }
  ]
}
const getJobTypeLabel = (type?: number) => {
  const map: Record<number, string> = {
    1: '全职',
    2: '实习',
    3: '兼职'
  }
  return type ? map[type] || '未知' : '未知'
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

// 加载投递列表
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

    const res = await getDeliveryList(queryParams)
    deliveryList.value = res.data.data || []
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
  queryParams.jobId = ''
  queryParams.studentName = ''
  dateRange.value = []
  handleQuery()
}

// 查看简历
const handleViewResume = async (row: DeliveryItem) => {
  try {
    const res = await getResumeDetail(row.resumeId)
    currentResume.value = res.data
    resumeDialogVisible.value = true
  } catch (error) {
    console.error('加载简历详情失败', error)
    ElMessage.error('加载简历详情失败')
  }
}

// 安排面试
const handleArrangeInterview = (row: DeliveryItem) => {
  interviewForm.deliveryId = row.id
  interviewForm.interviewTime = ''
  interviewForm.duration = 60
  interviewForm.type = 1
  interviewForm.location = ''
  interviewForm.notes = ''
  interviewDialogVisible.value = true
}

// 确认安排面试
const handleConfirmInterview = async () => {
  if (!interviewFormRef.value) return
  
  await interviewFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      await arrangeInterview(interviewForm)
      ElMessage.success('面试安排成功，已通知学生')
      interviewDialogVisible.value = false
      loadList()
    } catch (error) {
      console.error('安排面试失败', error)
      ElMessage.error('安排面试失败')
    } finally {
      submitting.value = false
    }
  })
}

// 拒绝
const handleReject = async (row: DeliveryItem) => {
  try {
    const result = await ElMessageBox.prompt('请输入拒绝原因（选填）', '确认拒绝', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入拒绝原因'
    })
    
    await rejectDelivery(row.id, result.value)
    ElMessage.success('操作成功')
    loadList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败', error)
      ElMessage.error('操作失败')
    }
  }
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

// AI筛选简历
const aiScreenDialogVisible = ref(false)
const aiScreenLoading = ref(false)
const aiScreenResults = ref<ResumeMatchVO[]>([])

const handleAIScreen = async () => {
  if (!queryParams.jobId) {
    ElMessage.warning('请先选择职位')
    return
  }

  const selectedJob = jobOptions.value.find(j => j.id === queryParams.jobId)
  
  ElMessageBox.confirm(
    `确定要为职位"${selectedJob?.jobName}"进行AI智能筛选吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(async () => {
    aiScreenLoading.value = true
    try {
      const res = await screenResumes(queryParams.jobId, 20)
      aiScreenResults.value = res.data || []
      aiScreenDialogVisible.value = true
      
      if (aiScreenResults.value.length === 0) {
        ElMessage.info('未找到匹配的简历，请尝试其他职位')
      } else {
        ElMessage.success(`找到 ${aiScreenResults.value.length} 份匹配简历`)
      }
    } catch (error) {
      console.error('AI筛选失败', error)
      ElMessage.error('AI筛选失败，请稍后重试')
    } finally {
      aiScreenLoading.value = false
    }
  }).catch(() => {
    // 取消操作
  })
}

// 查看AI筛选的简历详情
const handleViewAIResume = async (resumeId: string) => {
  try {
    const res = await getResumeDetail(resumeId)
    currentResume.value = res.data
    resumeDialogVisible.value = true
  } catch (error) {
    console.error('加载简历详情失败', error)
    ElMessage.error('加载简历详情失败')
  }
}

// 获取匹配度标签类型
const getMatchScoreType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 70) return 'warning'
  return 'info'
}

onMounted(() => {
  loadJobOptions()
  loadList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}
.resume-wrapper {
  background-color: #f9fafc;
  padding: 24px;
  border-radius: 8px;

  .header-card {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;

    .name-box {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      .name {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
      }
    }

    .basic-info {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      color: #606266;
      font-size: 14px;

      .info-item {
        display: flex;
        align-items: center;
        gap: 6px;
        .el-icon {
          color: #409eff;
        }
      }
    }
  }

  .section-card {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;

    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
      margin-bottom: 20px;
      display: flex;
      align-items: center;

      .title-line {
        width: 4px;
        height: 16px;
        background-color: #409eff;
        border-radius: 2px;
        margin-right: 8px;
      }
    }

    .intention-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      background: #f4f7fc;
      padding: 16px;
      border-radius: 6px;

      .int-item {
        font-size: 14px;
        .label {
          color: #909399;
          margin-right: 8px;
        }
        .val {
          color: #606266;
        }
      }
    }

    .summary-text {
      font-size: 14px;
      color: #606266;
      line-height: 1.8;
      white-space: pre-wrap;
      background: #fafafa;
      padding: 16px;
      border-radius: 6px;
      border-left: 3px solid #dcdfe6;
    }

    .timeline-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .company-name {
          font-size: 16px;
          font-weight: bold;
          color: #303133;
          margin: 0;
          display: flex;
          align-items: center;

          .project-link {
            font-size: 12px;
            color: #409eff;
            font-weight: normal;
            margin-left: 12px;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 4px;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }

      .desc-text {
        font-size: 14px;
        color: #606266;
        line-height: 1.8;
        white-space: pre-wrap;
      }
    }

    .edu-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .school-name {
        font-weight: bold;
        color: #303133;
        font-size: 15px;
      }
      .major-name {
        color: #606266;
        font-size: 14px;
      }
    }
  }
}

//.resume-detail {
//  .detail-section {
//    margin-bottom: 24px;
//
//    &:last-child {
//      margin-bottom: 0;
//    }
//
//    .section-title {
//      font-size: 16px;
//      font-weight: 600;
//      color: #303133;
//      margin-bottom: 12px;
//      padding-bottom: 8px;
//      border-bottom: 2px solid #409eff;
//    }
//
//    .content-box {
//      padding: 16px;
//      background-color: #f5f7fa;
//      border-radius: 4px;
//      line-height: 1.8;
//      color: #606266;
//      white-space: pre-wrap;
//    }
//  }
//}
</style>
