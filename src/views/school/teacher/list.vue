<template>
  <div class="app-container">
    <el-card shadow="never">
      <!-- 搜索表单 -->
      <el-form :model="queryParams" inline>
        <el-form-item label="教师姓名">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入教师姓名"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="工号">
          <el-input
            v-model="queryParams.employeeNo"
            placeholder="请输入工号"
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
        <el-form-item label="职称">
          <el-input
            v-model="queryParams.title"
            placeholder="请输入职称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
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
        :data="teacherList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="employeeNo" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="60" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.gender === '1'" type="primary" size="small">男</el-tag>
            <el-tag v-else-if="row.gender === '2'" type="danger" size="small">女</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="collegeName" label="学院" min-width="150" show-overflow-tooltip />
        <el-table-column prop="title" label="职称" width="120" />
        <el-table-column prop="expertise" label="专业领域" min-width="150" show-overflow-tooltip />
        <el-table-column prop="guidanceCount" label="指导项目数" width="110" align="center">
          <template #default="{ row }">
            <el-tag type="success" size="small">{{ row.guidanceCount || 0 }}</el-tag>
          </template>
        </el-table-column>
<!--        <el-table-column prop="ratingScore" label="评分" width="80" align="center">-->
<!--          <template #default="{ row }">-->
<!--            <el-rate v-model="row.ratingScore" disabled show-score text-color="#ff9900" score-template="{value}" />-->
<!--          </template>-->
<!--        </el-table-column>-->
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看详情
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

    <!-- 教师详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="教师详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border v-if="currentTeacher">
        <el-descriptions-item label="工号">{{ currentTeacher.employeeNo }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentTeacher.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">
          <el-tag v-if="currentTeacher.gender === '1'" type="primary" size="small">男</el-tag>
          <el-tag v-else-if="currentTeacher.gender === '2'" type="danger" size="small">女</el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="职称">{{ currentTeacher.title || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学院">{{ currentTeacher.collegeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="专业领域">{{ currentTeacher.expertise || '-' }}</el-descriptions-item>
        <el-descriptions-item label="指导项目数">{{ currentTeacher.guidanceCount || 0 }}</el-descriptions-item>
<!--        <el-descriptions-item label="评分">-->
<!--          <el-rate v-model="currentTeacher.ratingScore" disabled show-score />-->
<!--        </el-descriptions-item>-->
        <el-descriptions-item label="联系电话">{{ currentTeacher.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentTeacher.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="个人简介" :span="2">
          {{ currentTeacher.intro || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ currentTeacher.createTime || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog
      v-model="importVisible"
      title="批量导入教师"
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
            <p>1. 请先下载导入模板，按照模板格式填写教师信息</p>
            <p>2. 必填字段：工号、姓名、性别、学院</p>
            <p>3. 性别填写：男 或 女</p>
            <p>4. 职称填写：助教、讲师、副教授、教授等</p>
            <p>5. 系统会自动为每个教师创建账号，初始密码为：123456</p>
            <p>6. 如果工号已存在，将跳过该条记录</p>
          </div>
        </template>
      </el-alert>

      <el-upload
          ref="uploadRef"
          class="upload-demo"
          drag
          action="#"
          :http-request="customUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :before-upload="beforeUpload"
          :limit="1"
          :auto-upload="false"
          accept=".xlsx,.xls"
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
import { getTeacherList, getTeacherDetail, downloadTeacherTemplate, importTeachers, exportTeacherData } from '@/api/school'
import type { TeacherListItem, TeacherDetail } from '@/api/school'
import type { UploadInstance } from 'element-plus'
import { useUserStore } from '@/store/userStore'

const userStore = useUserStore()

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: '',
  employeeNo: '',
  collegeName: '',
  title: ''
})

// 数据
const loading = ref(false)
const teacherList = ref<TeacherListItem[]>([])
const total = ref(0)

// 详情对话框
const detailVisible = ref(false)
const currentTeacher = ref<TeacherDetail | null>(null)

// 导入对话框
const importVisible = ref(false)
const uploading = ref(false)
const uploadRef = ref<UploadInstance>()

// 导出状态控制
const exportLoading = ref(false)


// 加载教师列表
const loadData = async () => {
  loading.value = true
  try {
    const res = await getTeacherList(queryParams)
    teacherList.value = res.data.data
    total.value = res.data.total
  } catch (error) {
    console.error('加载教师列表失败', error)
    ElMessage.error('加载教师列表失败')
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
    name: '',
    employeeNo: '',
    collegeName: '',
    title: ''
  })
  loadData()
}

// 查看详情
const handleView = async (row: TeacherListItem) => {
  try {
    const res = await getTeacherDetail(row.teacherId)
    currentTeacher.value = res.data
    detailVisible.value = true
  } catch (error) {
    console.error('加载教师详情失败', error)
    ElMessage.error('加载教师详情失败')
  }
}

// 打开导入对话框
const handleImport = () => {
  importVisible.value = true
}

// 下载导入模板
const handleDownloadTemplate = async () => {
  try {
    const res = await downloadTeacherTemplate()
    const blob = new Blob([res], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '教师信息导入模板.xlsx'
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
// 3. 新增自定义上传逻辑
const customUpload = async (options: any) => {
  try {
    const res = await importTeachers(options.file)

    // 核心修复：兼容不同的 Axios 拦截器配置，准确找到后端的 JSON 响应体
    let responseData = res
    // 如果 res 包含 data，且 data 里面有 message，说明是标准的 Axios 外壳，需要剥离一层
    if (res.data && res.data.message) {
      responseData = res.data
    }

    // 将正确的 JSON 对象传给 el-upload
    options.onSuccess(responseData)
  } catch (error: any) {
    options.onError(error)
  }
}

// 提交上传 (这部分保持你原来的不变即可，点击按钮触发 submit，submit 会调用我们上面写的 customUpload)
const submitUpload = () => {
  if (!uploadRef.value) return
  uploading.value = true
  uploadRef.value.submit()
}

// 上传成功
const handleUploadSuccess = (response: any) => {
  uploading.value = false
  importVisible.value = false
  
  if (response.message === 'success') {
    const { successCount, failCount, failList } = response.data
    
    if (failCount === 0) {
      ElMessage.success(`导入成功！共导入 ${successCount} 条教师信息`)
    } else {
      ElMessageBox.alert(
        `成功导入 ${successCount} 条，失败 ${failCount} 条。\n失败原因：\n${failList.map((item: any) => `第${item.row}行：${item.reason}`).join('\n')}`,
        '导入结果',
        { type: 'warning' }
      )
    }
    
    loadData()
    uploadRef.value?.clearFiles()
  } else {
    ElMessage.error(response.message || '导入失败')
  }
}

// 上传失败
const handleUploadError = () => {
  uploading.value = false
  ElMessage.error('导入失败，请检查文件格式')
}

// 导出数据
const handleExport = async () => {
  try {
    await ElMessageBox.confirm('确认导出当前筛选条件下的教师数据？', '提示', {
      type: 'warning',
      confirmButtonText: '确认导出',
      cancelButtonText: '取消'
    })

    exportLoading.value = true

    const res = await exportTeacherData(queryParams)

    const blob = new Blob([res as any], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    const fileName = `教师数据导出_${new Date().getTime()}.xlsx`
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
</style>
