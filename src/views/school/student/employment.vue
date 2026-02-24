<template>
  <div class="app-container">
    <el-card shadow="never">
      <!-- 搜索表单 -->
      <el-form :model="queryParams" inline>
        <el-form-item label="学生姓名">
          <el-input
            v-model="queryParams.studentName"
            placeholder="请输入学生姓名"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="学号">
          <el-input
            v-model="queryParams.studentNo"
            placeholder="请输入学号"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="就业状态">
          <el-select
              v-model="queryParams.employmentStatus"
              placeholder="请选择就业状态"
              clearable
              style="width: 150px"
          >
            <el-option label="待就业" value="UNEMPLOYED" />
            <el-option label="已签约" value="SIGNED" />
          </el-select>
        </el-form-item>
        <el-form-item label="毕业年份">
          <el-select
            v-model="queryParams.graduationYear"
            placeholder="请选择毕业年份"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="year in yearOptions"
              :key="year"
              :label="`${year}年`"
              :value="year"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon class="mr-1"><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon class="mr-1"><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="mb-4">
        <el-col :xs="24" :sm="12" :md="12" v-for="(item, index) in statCards" :key="index">
          <el-card shadow="hover" class="stat-card" :body-style="{ padding: '20px' }">
            <div class="flex justify-between items-center">
              <div>
                <div class="text-sm text-gray-500 mb-2">{{ item.title }}</div>
                <div class="text-3xl font-bold text-gray-800 font-mono">{{ item.value }}</div>
                <div class="text-xs text-gray-400 mt-2">{{ item.subTitle }}</div>
              </div>
              <div class="icon-bg" :style="{ background: item.bgColor }">
                <el-icon :size="24" :color="item.iconColor"><component :is="item.icon" /></el-icon>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 操作按钮 -->
      <div class="mb-4">
        <el-button type="success" @click="handleExport" :loading="exportLoading">
          <el-icon class="mr-1"><Download /></el-icon>
          导出就业数据
        </el-button>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="employmentList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="collegeName" label="学院" min-width="150" show-overflow-tooltip />
        <el-table-column prop="majorName" label="专业" min-width="120" show-overflow-tooltip />
        <el-table-column prop="graduationYear" label="毕业年份" width="100" align="center">
          <template #default="{ row }">
            {{ row.graduationYear ? `${row.graduationYear}年` : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="employmentStatus" label="就业状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.employmentStatus === 'UNEMPLOYED'" type="info" size="small">待就业</el-tag>
            <el-tag v-else-if="row.employmentStatus === 'SIGNED'" type="success" size="small">已签约</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="companyName" label="就业单位" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.companyName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="position" label="职位" width="120">
          <template #default="{ row }">
            {{ row.position || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="salary" label="薪资" width="100">
          <template #default="{ row }">
            {{ row.salary || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="employmentDate" label="就业日期" width="120" align="center">
          <template #default="{ row }">
            {{ row.employmentDate || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
<!--            <el-button link type="primary" size="small" @click="handleEdit(row)">-->
<!--              编辑-->
<!--            </el-button>-->
            <el-button link type="primary" size="small" @click="handleView(row)">
              详情
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

    <!-- 编辑就业信息对话框 -->
    <el-dialog
      v-model="editVisible"
      title="编辑就业信息"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="学生信息">
          <div class="text-gray-700">
            {{ formData.studentName }} ({{ formData.studentNo }}) - {{ formData.majorName }}
          </div>
        </el-form-item>
        <el-form-item label="就业状态" prop="employmentStatus">
          <el-radio-group v-model="formData.employmentStatus">
            <el-radio label="UNEMPLOYED">待就业</el-radio>
            <el-radio label="SIGNED">已签约</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 已就业时显示 -->
        <template v-if="formData.employmentStatus === 'SIGNED'">
          <el-form-item label="就业单位" prop="companyName">
            <el-input v-model="formData.companyName" placeholder="请输入就业单位" />
          </el-form-item>
          <el-form-item label="职位" prop="position">
            <el-input v-model="formData.position" placeholder="请输入职位" />
          </el-form-item>
          <el-form-item label="薪资" prop="salary">
            <el-input v-model="formData.salary" placeholder="如：8-12K" />
          </el-form-item>
          <el-form-item label="就业日期" prop="employmentDate">
            <el-date-picker
              v-model="formData.employmentDate"
              type="date"
              placeholder="选择就业日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="工作地点" prop="workLocation">
            <el-input v-model="formData.workLocation" placeholder="请输入工作地点" />
          </el-form-item>
        </template>

        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 就业详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="就业详情"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border v-if="currentDetail">
        <el-descriptions-item label="学号">{{ currentDetail.studentNo }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentDetail.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学院">{{ currentDetail.collegeName }}</el-descriptions-item>
        <el-descriptions-item label="专业">{{ currentDetail.majorName }}</el-descriptions-item>
        <el-descriptions-item label="毕业年份">
          {{ currentDetail.graduationYear ? `${currentDetail.graduationYear}年` : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="就业状态">
          <el-tag v-if="currentDetail.employmentStatus === 'UNEMPLOYED'" type="info" size="small">待就业</el-tag>
          <el-tag v-else-if="currentDetail.employmentStatus === 'SIGNED'" type="success" size="small">已签约</el-tag>
        </el-descriptions-item>

        <!-- 已就业详情 -->
        <template v-if="currentDetail.employmentStatus === 'SIGNED'">
          <el-descriptions-item label="就业单位">{{ currentDetail.companyName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="职位">{{ currentDetail.position || '-' }}</el-descriptions-item>
          <el-descriptions-item label="薪资">{{ currentDetail.salary || '-' }}</el-descriptions-item>
          <el-descriptions-item label="就业日期">{{ currentDetail.employmentDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="工作地点" :span="2">{{ currentDetail.workLocation || '-' }}</el-descriptions-item>
        </template>

        <el-descriptions-item label="备注" :span="2">{{ currentDetail.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ currentDetail.updateTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Download, User, Briefcase } from '@element-plus/icons-vue'
import { getEmploymentList, getEmploymentDetail, updateEmploymentInfo, getEmploymentStats, exportEmploymentData } from '@/api/school'
import type { EmploymentListItem, EmploymentDetail, EmploymentForm } from '@/api/school'
import type { FormInstance, FormRules } from 'element-plus'

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  studentName: '',
  studentNo: '',
  employmentStatus: '',
  graduationYear: null as number | null
})

// 数据
const loading = ref(false)
const employmentList = ref<EmploymentListItem[]>([])
const total = ref(0)

// 年份选项（最近5年）
const currentYear = new Date().getFullYear()
const yearOptions = ref<number[]>(
  Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
)

// 统计数据
const statCards = ref([
  {
    title: '总人数',
    value: 0,
    subTitle: '统计范围内学生',
    icon: User,
    bgColor: '#ecf5ff',
    iconColor: '#409eff'
  },
  {
    title: '已就业',
    value: 0,
    subTitle: '就业率 0%',
    icon: Briefcase,
    bgColor: '#f0f9eb',
    iconColor: '#67c23a'
  }
])

// 编辑对话框
const editVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive<EmploymentForm>({
  studentId: '',
  studentName: '',
  studentNo: '',
  majorName: '',
  employmentStatus: 'UNEMPLOYED',
  companyName: '',
  position: '',
  salary: '',
  employmentDate: '',
  workLocation: '',
  remark: ''
})

// 表单验证规则
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    employmentStatus: [{ required: true, message: '请选择就业状态', trigger: 'change' }]
  }

  // 已就业时的验证规则
  if (formData.employmentStatus === 'SIGNED') { // 这里的 '1' 改为 'SIGNED'
    rules.companyName = [{ required: true, message: '请输入就业单位', trigger: 'blur' }]
    rules.position = [{ required: true, message: '请输入职位', trigger: 'blur' }]
  }

  return rules
})

// 详情对话框
const detailVisible = ref(false)
const currentDetail = ref<EmploymentDetail | null>(null)

// 导出状态控制
const exportLoading = ref(false)

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await getEmploymentStats(queryParams)
    const stats = res.data
    statCards.value[0].value = stats.totalCount
    statCards.value[1].value = stats.employedCount
    statCards.value[1].subTitle = `就业率 ${stats.employmentRate}%`
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

// 加载就业列表
const loadData = async () => {
  loading.value = true
  try {
    const res = await getEmploymentList(queryParams)
    employmentList.value = res.data.data
    total.value = res.data.total
    
    // 加载统计数据
    await loadStats()
  } catch (error) {
    console.error('加载就业列表失败', error)
    ElMessage.error('加载就业列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  loadData()
}

// 重置
const handleReset = () => {
  Object.assign(queryParams, {
    pageNum: 1,
    pageSize: 10,
    studentName: '',
    studentNo: '',
    employmentStatus: '',
    graduationYear: null
  })
  loadData()
}

// 编辑
const handleEdit = (row: EmploymentListItem) => {
  Object.assign(formData, {
    studentId: row.studentId,
    studentName: row.studentName,
    studentNo: row.studentNo,
    majorName: row.majorName,
    employmentStatus: row.employmentStatus || 'UNEMPLOYED',
    companyName: row.companyName || '',
    position: row.position || '',
    salary: row.salary || '',
    employmentDate: row.employmentDate || '',
    workLocation: row.workLocation || '',
    remark: row.remark || ''
  })
  editVisible.value = true
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      await updateEmploymentInfo(formData)
      ElMessage.success('保存成功')
      editVisible.value = false
      loadData()
    } catch (error) {
      console.error('保存失败', error)
      ElMessage.error('保存失败')
    } finally {
      submitting.value = false
    }
  })
}

// 查看详情
const handleView = async (row: EmploymentListItem) => {
  try {
    const res = await getEmploymentDetail(row.studentId)
    currentDetail.value = res.data
    detailVisible.value = true
  } catch (error) {
    console.error('加载就业详情失败', error)
    ElMessage.error('加载就业详情失败')
  }
}

// 导出数据
const handleExport = async () => {
  try {
    await ElMessageBox.confirm('确认导出当前筛选条件下的就业数据？', '提示', {
      type: 'warning',
      confirmButtonText: '确认导出',
      cancelButtonText: '取消'
    })

    exportLoading.value = true

    const res = await exportEmploymentData(queryParams)

    const blob = new Blob([res as any], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    const fileName = `就业数据导出_${new Date().getTime()}.xlsx`
    link.setAttribute('download', fileName)

    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('导出失败', error)
      ElMessage.error('导出失败，请检查网络或联系管理员')
    }
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.stat-card {
  border: none;
  transition: all 0.3s;
  cursor: pointer;
  margin-bottom: 20px;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .icon-bg {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
