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
        <el-form-item label="学院">
          <el-input
            v-model="queryParams.collegeName"
            placeholder="请输入学院"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="专业">
          <el-input
            v-model="queryParams.majorName"
            placeholder="请输入专业"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="年级">
          <el-select
            v-model="queryParams.enrollmentYear"
            placeholder="请选择年级"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="year in yearOptions"
              :key="year"
              :label="`${year}级`"
              :value="year"
            />
          </el-select>
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

      <!-- 操作按钮 -->
      <div class="mb-4 flex justify-between items-center">
        <div>
          <el-button type="primary" @click="handleImport">
            <el-icon class="mr-1"><Upload /></el-icon>
            批量导入
          </el-button>
          <el-button type="success" @click="handleDownloadTemplate">
            <el-icon class="mr-1"><Download /></el-icon>
            下载模板
          </el-button>
        </div>
        <el-button type="success" @click="handleExport" :loading="exportLoading">
          <el-icon class="mr-1"><Download /></el-icon>
          导出数据
        </el-button>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="studentList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="60" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.gender === '1'" type="primary" size="small">男</el-tag>
            <el-tag v-else-if="row.gender === '2'" type="danger" size="small">女</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="collegeName" label="学院" min-width="150" show-overflow-tooltip />
        <el-table-column prop="majorName" label="专业" min-width="120" show-overflow-tooltip />
        <el-table-column prop="className" label="班级" width="100" />
        <el-table-column prop="education" label="学历" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.education" size="small">{{ row.education }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="enrollmentYear" label="入学年份" width="100" align="center">
          <template #default="{ row }">
            {{ row.enrollmentYear ? `${row.enrollmentYear}级` : '-' }}
          </template>
        </el-table-column>
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
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看详情
            </el-button>
            <el-button link type="primary" size="small" @click="handleViewResume(row)">
              查看简历
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

    <!-- 学生详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="学生详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border v-if="currentStudent">
        <el-descriptions-item label="学号">{{ currentStudent.studentNo }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentStudent.studentName }}</el-descriptions-item>
        <el-descriptions-item label="性别">
          <el-tag v-if="currentStudent.gender === '1'" type="primary" size="small">男</el-tag>
          <el-tag v-else-if="currentStudent.gender === '2'" type="danger" size="small">女</el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="学历">{{ currentStudent.education || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学院">{{ currentStudent.collegeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="专业">{{ currentStudent.majorName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ currentStudent.className || '-' }}</el-descriptions-item>
        <el-descriptions-item label="入学年份">
          {{ currentStudent.enrollmentYear ? `${currentStudent.enrollmentYear}级` : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="毕业年份">
          {{ currentStudent.graduationYear ? `${currentStudent.graduationYear}年` : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="就业状态">
          <el-tag v-if="currentStudent.employmentStatus === 'UNEMPLOYED'" type="info" size="small">待就业</el-tag>
          <el-tag v-else-if="currentStudent.employmentStatus === 'SIGNED'" type="success" size="small">已签约</el-tag>
          <el-tag v-else-if="currentStudent.employmentStatus === '2'" type="primary" size="small">升学</el-tag>
          <el-tag v-else-if="currentStudent.employmentStatus === '3'" type="warning" size="small">出国</el-tag>
          <el-tag v-else-if="currentStudent.employmentStatus === '4'" type="danger" size="small">创业</el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentStudent.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentStudent.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ currentStudent.createTime || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 简历查看对话框 -->
    <el-dialog
      v-model="resumeVisible"
      title="学生简历"
      width="900px"
      :close-on-click-modal="false"
    >
      <div v-if="currentResume" v-loading="resumeLoading">
        <!-- 基本信息 -->
        <el-card shadow="never" class="mb-3">
          <template #header>
            <span class="font-bold">基本信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="期望职位">{{ currentResume.expectedPosition || '-' }}</el-descriptions-item>
            <el-descriptions-item label="期望薪资">{{ currentResume.expectedSalary || '-' }}</el-descriptions-item>
            <el-descriptions-item label="目标城市">{{ currentResume.targetCity || '-' }}</el-descriptions-item>
            <el-descriptions-item label="工作类型">
              <el-tag v-if="currentResume.jobType === 1" size="small">全职</el-tag>
              <el-tag v-else-if="currentResume.jobType === 2" type="success" size="small">实习</el-tag>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="到岗时间">{{ currentResume.arrivalTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="简历评分">
              <el-rate v-model="currentResume.resumeScore" disabled show-score />
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 个人总结 -->
        <el-card shadow="never" class="mb-3" v-if="currentResume.personalSummary">
          <template #header>
            <span class="font-bold">个人总结</span>
          </template>
          <div class="text-gray-700">{{ currentResume.personalSummary }}</div>
        </el-card>

        <!-- 技能特长 -->
        <el-card shadow="never" class="mb-3" v-if="currentResume.skills">
          <template #header>
            <span class="font-bold">技能特长</span>
          </template>
          <div class="text-gray-700">{{ currentResume.skills }}</div>
        </el-card>

        <!-- 教育经历 -->
        <el-card shadow="never" class="mb-3" v-if="currentResume.educationHistory?.length">
          <template #header>
            <span class="font-bold">教育经历</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(edu, index) in currentResume.educationHistory"
              :key="index"
              :timestamp="`${edu.startDate} - ${edu.endDate}`"
            >
              <div class="font-medium">{{ edu.school }}</div>
              <div class="text-sm text-gray-500">{{ edu.major }} · {{ edu.degree }}</div>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 实习经历 -->
        <el-card shadow="never" class="mb-3" v-if="currentResume.internshipExp?.length">
          <template #header>
            <span class="font-bold">实习经历</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(exp, index) in currentResume.internshipExp"
              :key="index"
              :timestamp="`${exp.startDate} - ${exp.endDate}`"
            >
              <div class="font-medium">{{ exp.company }} - {{ exp.position }}</div>
              <div class="text-sm text-gray-700 mt-2">{{ exp.description }}</div>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 项目经历 -->
        <el-card shadow="never" v-if="currentResume.projectExp?.length">
          <template #header>
            <span class="font-bold">项目经历</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(proj, index) in currentResume.projectExp"
              :key="index"
              :timestamp="`${proj.startDate} - ${proj.endDate}`"
            >
              <div class="font-medium">{{ proj.name }} - {{ proj.role }}</div>
              <div class="text-sm text-gray-700 mt-2">{{ proj.description }}</div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </div>
      <div v-else class="text-center text-gray-400 py-10">
        该学生暂未完善简历
      </div>
      <template #footer>
        <el-button @click="resumeVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog
      v-model="importVisible"
      title="批量导入学生"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-alert
        title="导入说明"
        type="info"
        :closable="false"
        class="mb-4"
      >
        <template #default>
          <div class="text-sm">
            <p>1. 请先下载导入模板，按照模板格式填写学生信息</p>
            <p>2. 必填字段：学号、姓名、性别、学院、专业、入学年份、毕业年份</p>
            <p>3. 性别填写：男 或 女</p>
            <p>4. 学历填写：专科、本科、硕士</p>
            <p>5. 系统会自动为每个学生创建账号，初始密码为：123456</p>
            <p>6. 如果学号已存在，将跳过该条记录</p>
          </div>
        </template>
      </el-alert>

      <el-upload
          ref="uploadRef"
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :before-upload="beforeUpload"
          :limit="1"
          :on-exceed="handleExceed"
          v-model:file-list="fileList"   accept=".xlsx,.xls"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将Excel文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 xlsx/xls 文件，且不超过 5MB
          </div>
        </template>
      </el-upload>

      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpload" :loading="uploading">
          确认导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Download, Upload, UploadFilled } from '@element-plus/icons-vue'
import { getStudentList, getStudentDetail, getStudentResume, exportStudentData, downloadTemplate, importStudents } from '@/api/school'
import type { StudentListItem, StudentDetail, StudentResume } from '@/api/school'
import type { UploadInstance } from 'element-plus'
import { useUserStore } from '@/store/userStore'

const userStore = useUserStore()

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  studentName: '',
  studentNo: '',
  collegeName: '',
  majorName: '',
  enrollmentYear: null as number | null,
  employmentStatus: ''
})

// 数据
const loading = ref(false)
const studentList = ref<StudentListItem[]>([])
const total = ref(0)

// 年级选项（最近10年）
const currentYear = new Date().getFullYear()
const yearOptions = ref<number[]>(
  Array.from({ length: 10 }, (_, i) => currentYear - i)
)

// 详情对话框
const detailVisible = ref(false)
const currentStudent = ref<StudentDetail | null>(null)

// 简历对话框
const resumeVisible = ref(false)
const resumeLoading = ref(false)
const currentResume = ref<StudentResume | null>(null)

// 导入对话框
const importVisible = ref(false)
const uploading = ref(false)
const uploadRef = ref<UploadInstance>()

import type { UploadInstance, UploadUserFile, UploadRawFile } from 'element-plus' // 确保顶部引入了 UploadUserFile

// ！！！1. 新增一个响应式变量来专门存放文件列表 ！！！
const fileList = ref<UploadUserFile[]>([])

// ！！！2. 替换你刚才报错的 submitUpload 方法 ！！！
const submitUpload = async () => {
  // 直接通过我们绑定的 fileList 来判断文件是否存在
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要导入的 Excel 文件')
    return
  }

  // 取出真正的源文件
  const rawFile = fileList.value[0].raw
  if (!rawFile) return

  uploading.value = true
  try {
    // 发起 Axios 请求
    const res = await importStudents(rawFile)

    uploading.value = false
    importVisible.value = false

    if (res.message === 'success' || res.code === 200) {
      const { successCount, failCount, failList } = res.data || {}

      if (failCount === 0) {
        ElMessage.success(`导入成功！共导入 ${successCount} 条学生信息`)
      } else {
        ElMessageBox.alert(
            `成功导入 ${successCount} 条，失败 ${failCount} 条。\n失败原因：\n${failList.map((item: any) => `第${item.row}行：${item.reason}`).join('\n')}`,
            '导入结果',
            { type: 'warning' }
        )
      }

      loadData()
      // 清空上传组件和文件列表
      uploadRef.value?.clearFiles()
      fileList.value = [] // 同步清空绑定的列表
    } else {
      ElMessage.error(res.message || '导入失败')
    }
  } catch (error: any) {
    uploading.value = false
    console.error('导入异常:', error)
    ElMessage.error(error.message || '导入失败，请检查文件格式或网络')
  }
}

// 加载学生列表
const loadData = async () => {
  loading.value = true
  try {
    const res = await getStudentList(queryParams)
    studentList.value = res.data.data
    total.value = res.data.total
  } catch (error) {
    console.error('加载学生列表失败', error)
    ElMessage.error('加载学生列表失败')
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
    collegeName: '',
    majorName: '',
    enrollmentYear: null,
    employmentStatus: ''
  })
  loadData()
}

// 查看详情
const handleView = async (row: StudentListItem) => {
  try {
    const res = await getStudentDetail(row.studentId)
    currentStudent.value = res.data
    detailVisible.value = true
  } catch (error) {
    console.error('加载学生详情失败', error)
    ElMessage.error('加载学生详情失败')
  }
}

// 查看简历
const handleViewResume = async (row: StudentListItem) => {
  resumeVisible.value = true
  resumeLoading.value = true
  currentResume.value = null
  try {
    const res = await getStudentResume(row.studentId)
    currentResume.value = res.data
  } catch (error: any) {
    console.error('加载学生简历失败', error)
    if (error.response?.status === 404) {
      // 简历不存在，显示空状态
      currentResume.value = null
    } else {
      ElMessage.error('加载学生简历失败')
    }
  } finally {
    resumeLoading.value = false
  }
}

// 导出数据
// 导出状态控制
const exportLoading = ref(false)

// 导出数据
const handleExport = async () => {
  try {
    await ElMessageBox.confirm('确认导出当前筛选条件下的学生数据？', '提示', {
      type: 'warning',
      confirmButtonText: '确认导出',
      cancelButtonText: '取消'
    })

    exportLoading.value = true

    // 1. 发起请求获取 Blob 数据流，传入当前的查询参数
    const res = await exportStudentData(queryParams)

    // 2. 将响应数据转换为 Blob 对象
    // 注意：这里的 [res] 或者 [res.data] 取决于你的 axios 响应拦截器
    // 如果你在拦截器里直接返回了 response.data，这里写 [res] 即可（与你的 downloadTemplate 保持一致）
    const blob = new Blob([res as any], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    // 3. 生成可下载的 URL
    const url = window.URL.createObjectURL(blob)

    // 4. 动态创建 <a> 标签触发下载
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    // 可以拼接当前时间戳让每次导出的文件名都不一样
    const fileName = `学生数据导出_${new Date().getTime()}.xlsx`
    link.setAttribute('download', fileName)

    document.body.appendChild(link)
    link.click()

    // 5. 释放内存与清理 DOM
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error: any) {
    // 过滤掉用户点击取消触发的 catch
    if (error !== 'cancel') {
      console.error('导出失败', error)
      ElMessage.error('导出失败，请检查网络或联系管理员')
    }
  } finally {
    exportLoading.value = false
  }
}

// 打开导入对话框
const handleImport = () => {
  importVisible.value = true
}

// 下载导入模板
const handleDownloadTemplate = async () => {
  try {
    const res = await downloadTemplate()
    // 创建下载链接
    const blob = new Blob([res], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '学生信息导入模板.xlsx'
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('模板下载成功')
  } catch (error) {
    console.error('下载模板失败', error)
    ElMessage.error('下载模板失败')
  }
}

// 上传前校验
const beforeUpload = (file: File) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    || file.type === 'application/vnd.ms-excel'
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('文件大小不能超过 5MB!')
    return false
  }
  return true
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}
</style>
