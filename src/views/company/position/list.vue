<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="职位名称">
          <el-input v-model="queryParams.jobName" placeholder="请输入职位名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="queryParams.audit" placeholder="请选择审核状态" clearable style="width: 150px">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已驳回" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="在招状态">
          <el-select v-model="queryParams.status" placeholder="请选择在招状态" clearable style="width: 150px">
            <el-option label="在招" :value="1" />
            <el-option label="已下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          <el-button type="primary" :icon="Plus" @click="handleAdd">发布新职位</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="jobList" style="width: 100%">
        <el-table-column prop="jobName" label="职位名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="salaryRange" label="薪资范围" width="120" align="center" />
        <el-table-column prop="city" label="工作城市" width="100" align="center" />
        <el-table-column prop="education" label="学历要求" width="100" align="center">
          <template #default="{ row }">
            {{ getEducationLabel(row.education) }}
          </template>
        </el-table-column>
        <el-table-column prop="experience" label="工作经验" width="100" align="center">
          <template #default="{ row }">
            {{ getExperienceLabel(row.experience) }}
          </template>
        </el-table-column>
        <el-table-column prop="audit" label="审核状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getAuditTagType(row.audit)" size="small">
              {{ getAuditLabel(row.audit) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="在招状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '在招' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="100" align="center">
          <template #default="{ row }">
            <span class="text-blue-500">{{ row.viewCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deliveryCount" label="投递数" width="100" align="center">
          <template #default="{ row }">
            <span class="text-green-500 font-bold cursor-pointer" @click="handleViewDeliveries(row)">
              {{ row.deliveryCount || 0 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180" align="center" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              v-if="row.status === 1" 
              link 
              type="warning" 
              size="small" 
              @click="handleOffline(row)"
            >
              下架
            </el-button>
            <el-button 
              v-if="row.status === 0" 
              link 
              type="success" 
              size="small" 
              @click="handleOnline(row)"
            >
              上架
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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

    <!-- 查看详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="职位详情" width="800px">
      <div v-if="currentJob" class="job-detail">
        <div class="detail-section">
          <h3 class="section-title">基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="职位名称">{{ currentJob.jobName }}</el-descriptions-item>
            <el-descriptions-item label="薪资范围">{{ currentJob.salaryRange }}</el-descriptions-item>
            <el-descriptions-item label="工作城市">{{ currentJob.city }}</el-descriptions-item>
            <el-descriptions-item label="学历要求">{{ getEducationLabel(currentJob.education) }}</el-descriptions-item>
            <el-descriptions-item label="工作经验">{{ getExperienceLabel(currentJob.experience) }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ currentJob.contactPhone }}</el-descriptions-item>
            <el-descriptions-item label="审核状态">
              <el-tag :type="getAuditTagType(currentJob.audit)" size="small">
                {{ getAuditLabel(currentJob.audit) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="在招状态">
              <el-tag :type="currentJob.status === 1 ? 'success' : 'info'" size="small">
                {{ currentJob.status === 1 ? '在招' : '已下架' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="浏览量">{{ currentJob.viewCount }}</el-descriptions-item>
            <el-descriptions-item label="投递数">{{ currentJob.deliveryCount || 0 }}</el-descriptions-item>
            <el-descriptions-item label="发布时间" :span="2">{{ currentJob.createTime }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section" v-if="currentJob.tags">
          <h3 class="section-title">职位标签</h3>
          <el-tag v-for="(tag, index) in currentJob.tags.split(',')" :key="index" class="mr-2 mb-2">
            {{ tag }}
          </el-tag>
        </div>

        <div class="detail-section">
          <h3 class="section-title">职位描述</h3>
          <div class="content-box">{{ currentJob.description }}</div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">任职要求</h3>
          <div class="content-box">{{ currentJob.requirement }}</div>
        </div>

        <div class="detail-section" v-if="currentJob.audit === 2 && currentJob.reason">
          <h3 class="section-title">驳回原因</h3>
          <el-alert type="error" :closable="false">
            {{ currentJob.reason }}
          </el-alert>
        </div>
      </div>
    </el-dialog>

    <!-- 发布/编辑职位对话框 -->
    <el-dialog 
      v-model="formDialogVisible" 
      :title="isEdit ? '编辑职位' : '发布新职位'" 
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="职位名称" prop="jobName">
          <el-input
            v-model="formData.jobName"
            placeholder="请输入职位名称，如：Java开发工程师"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="薪资范围" prop="salaryRange">
          <el-select v-model="formData.salaryRange" placeholder="请选择薪资范围" style="width: 100%">
            <el-option label="3K-5K" value="3-5K" />
            <el-option label="5K-8K" value="5-8K" />
            <el-option label="8K-12K" value="8-12K" />
            <el-option label="12K-20K" value="12-20K" />
            <el-option label="20K-30K" value="20-30K" />
            <el-option label="30K以上" value="30K+" />
            <el-option label="面议" value="negotiable" />
          </el-select>
        </el-form-item>

        <el-form-item label="工作城市" prop="city">
          <el-input v-model="formData.city" placeholder="请输入工作城市，如：成都" />
        </el-form-item>

        <el-form-item label="学历要求" prop="education">
          <el-select v-model="formData.education" placeholder="请选择学历要求" style="width: 100%">
            <el-option label="不限" value="unlimited" />
            <el-option label="大专" value="college" />
            <el-option label="本科" value="bachelor" />
            <el-option label="硕士" value="master" />
            <el-option label="博士" value="doctor" />
          </el-select>
        </el-form-item>

        <el-form-item label="工作经验" prop="experience">
          <el-select v-model="formData.experience" placeholder="请选择工作经验要求" style="width: 100%">
            <el-option label="不限" value="unlimited" />
            <el-option label="应届生" value="fresh" />
            <el-option label="1年以下" value="0-1" />
            <el-option label="1-3年" value="1-3" />
            <el-option label="3-5年" value="3-5" />
            <el-option label="5-10年" value="5-10" />
            <el-option label="10年以上" value="10+" />
          </el-select>
        </el-form-item>

        <el-form-item label="职位标签">
          <el-input
            v-model="formData.tags"
            placeholder="请输入职位标签，多个用逗号分隔，如：五险一金,双休,年终奖"
            maxlength="200"
          />
          <div class="text-xs text-gray-400 mt-1">提示：标签可以包括福利待遇、工作特点等</div>
        </el-form-item>

        <el-form-item label="职位描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="5"
            placeholder="请详细描述职位职责和工作内容"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="任职要求" prop="requirement">
          <el-input
            v-model="formData.requirement"
            type="textarea"
            :rows="5"
            placeholder="请详细描述任职要求和技能要求"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="联系电话" prop="contactPhone">
          <el-input
            v-model="formData.contactPhone"
            placeholder="请输入联系电话"
            maxlength="20"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button @click="handleFormReset">重置</el-button>
        <el-button type="primary" @click="handleFormSubmit" :loading="submitting">
          {{ isEdit ? '保存修改' : '立即发布' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import {
  getJobList,
  deleteJob,
  offlineJob,
  onlineJob,
  addJob,
  updateJob,
  getJobDetail,
  type JobQuery,
  type JobListItem,
  type JobForm
} from '@/api/company'

const router = useRouter()

// --- 查询参数 ---
const queryParams = reactive<JobQuery>({
  pageNum: 1,
  pageSize: 10,
  jobName: '',
  audit: null,
  status: null
})

// --- 列表数据 ---
const loading = ref(false)
const jobList = ref<JobListItem[]>([])
const total = ref(0)

// --- 查看详情 ---
const viewDialogVisible = ref(false)
const currentJob = ref<JobListItem | null>(null)

// --- 发布/编辑职位 ---
const formDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)
const isEdit = ref(false)
const editJobId = ref('')

const formData = reactive<JobForm>({
  jobName: '',
  salaryRange: '',
  city: '',
  education: '',
  experience: '',
  tags: '',
  description: '',
  requirement: '',
  contactPhone: ''
})

const formRules = {
  jobName: [
    { required: true, message: '请输入职位名称', trigger: 'blur' },
    { min: 2, max: 100, message: '职位名称长度在2-100个字符', trigger: 'blur' }
  ],
  salaryRange: [
    { required: true, message: '请选择薪资范围', trigger: 'change' }
  ],
  city: [
    { required: true, message: '请输入工作城市', trigger: 'blur' }
  ],
  education: [
    { required: true, message: '请选择学历要求', trigger: 'change' }
  ],
  experience: [
    { required: true, message: '请选择工作经验要求', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入职位描述', trigger: 'blur' },
    { min: 10, message: '职位描述至少10个字符', trigger: 'blur' }
  ],
  requirement: [
    { required: true, message: '请输入任职要求', trigger: 'blur' },
    { min: 10, message: '任职要求至少10个字符', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// --- 加载列表 ---
const loadList = async () => {
  loading.value = true
  try {
    const res = await getJobList(queryParams)
    jobList.value = res.data.data || []
    total.value = res.data.total
  } catch (error) {
    console.error('加载列表失败', error)
    ElMessage.error('加载列表失败')
  } finally {
    loading.value = false
  }
}

// --- 搜索 ---
const handleQuery = () => {
  queryParams.pageNum = 1
  loadList()
}

// --- 重置 ---
const handleReset = () => {
  queryParams.jobName = ''
  queryParams.audit = null
  queryParams.status = null
  handleQuery()
}

// --- 新增 ---
const handleAdd = () => {
  isEdit.value = false
  editJobId.value = ''
  formRef.value?.resetFields()
  Object.assign(formData, {
    jobName: '',
    salaryRange: '',
    city: '',
    education: '',
    experience: '',
    tags: '',
    description: '',
    requirement: '',
    contactPhone: ''
  })
  formDialogVisible.value = true
}

// --- 编辑 ---
const handleEdit = async (row: JobListItem) => {
  isEdit.value = true
  editJobId.value = row.id || row.jobId || ''
  try {
    const res = await getJobDetail(row.id || row.jobId || '')
    const data = res.data
    Object.assign(formData, {
      jobName: data.jobName,
      salaryRange: data.salaryRange,
      city: data.city,
      education: data.education,
      experience: data.experience,
      tags: data.tags || '',
      description: data.description,
      requirement: data.requirement,
      contactPhone: data.contactPhone
    })
    formDialogVisible.value = true
  } catch (error) {
    console.error('加载职位详情失败', error)
    ElMessage.error('加载职位详情失败')
  }
}

// --- 提交表单 ---
const handleFormSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      if (isEdit.value) {
        await updateJob({ jobId: editJobId.value, ...formData })
        ElMessage.success('职位修改成功')
      } else {
        await addJob(formData)
        ElMessage.success('职位发布成功，等待管理员审核')
      }
      formDialogVisible.value = false
      loadList()
    } catch (error) {
      console.error('操作失败', error)
      ElMessage.error(isEdit.value ? '修改失败' : '发布失败')
    } finally {
      submitting.value = false
    }
  })
}

// --- 重置表单 ---
const handleFormReset = () => {
  formRef.value?.resetFields()
}

// --- 查看 ---
const handleView = (row: JobListItem) => {
  currentJob.value = row
  viewDialogVisible.value = true
}

// --- 查看投递 ---
const handleViewDeliveries = (row: JobListItem) => {
  router.push({
    path: '/company/recruitment/pending',
    query: { jobId: row.id || row.jobId }
  })
}

// --- 下架 ---
const handleOffline = async (row: JobListItem) => {
  try {
    await ElMessageBox.confirm('确认下架该职位吗？下架后学生将无法看到此职位。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await offlineJob(row.id || row.jobId || '')
    ElMessage.success('下架成功')
    loadList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('下架失败', error)
      ElMessage.error('下架失败')
    }
  }
}

// --- 上架 ---
const handleOnline = async (row: JobListItem) => {
  try {
    await ElMessageBox.confirm('确认上架该职位吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    await onlineJob(row.id || row.jobId || '')
    ElMessage.success('上架成功')
    loadList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('上架失败', error)
      ElMessage.error('上架失败')
    }
  }
}

// --- 删除 ---
const handleDelete = async (row: JobListItem) => {
  try {
    await ElMessageBox.confirm('确认删除该职位吗？删除后无法恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    await deleteJob(row.id || row.jobId || '')
    ElMessage.success('删除成功')
    loadList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
      ElMessage.error('删除失败')
    }
  }
}

// --- 工具函数 ---
const getEducationLabel = (education: string) => {
  const map: Record<string, string> = {
    'unlimited': '不限',
    'college': '大专',
    'bachelor': '本科',
    'master': '硕士',
    'doctor': '博士'
  }
  return map[education] || education
}

const getExperienceLabel = (experience: string) => {
  const map: Record<string, string> = {
    'unlimited': '不限',
    'fresh': '应届生',
    '0-1': '1年以下',
    '1-3': '1-3年',
    '3-5': '3-5年',
    '5-10': '5-10年',
    '10+': '10年以上'
  }
  return map[experience] || experience
}

const getAuditLabel = (audit: number) => {
  const map: Record<number, string> = {
    0: '待审核',
    1: '已通过',
    2: '已驳回'
  }
  return map[audit] || '未知'
}

const getAuditTagType = (audit: number) => {
  const map: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return map[audit] || ''
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

.job-detail {
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
