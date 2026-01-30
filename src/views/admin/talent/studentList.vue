<template>
  <div class="app-container">
    <el-row :gutter="20" class="h-full">
      <el-col :span="5" :xs="24" class="mb-4">
        <el-card shadow="never" class="h-full left-card">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-bold text-gray-700">生源学校</span>
              <el-tag type="info" size="small" round>{{ schoolList.length }}所</el-tag>
            </div>
          </template>

          <el-input
              v-model="schoolSearch"
              placeholder="输入校名快速定位"
              prefix-icon="Search"
              clearable
              class="mb-4"
          />

          <div class="school-list-container custom-scrollbar">
            <div
                class="school-item"
                :class="{ 'is-active': currentSchoolId === '' }"
                @click="handleSelectSchool({ id: '', schoolName: '所有学校' })"
            >
              <div class="flex items-center">
                <el-icon class="mr-2 text-gray-500"><DataLine /></el-icon>
                <span>全平台数据</span>
              </div>
            </div>

            <div
                v-for="item in filteredSchoolList"
                :key="item.id"
                class="school-item"
                :class="{ 'is-active': currentSchoolId === item.id }"
                @click="handleSelectSchool(item)"
            >
              <div class="flex items-center">
                <el-icon class="mr-2" :class="currentSchoolId === item.id ? 'text-blue-500' : 'text-gray-400'"><School /></el-icon>
                <span class="truncate" :title="item.schoolName">{{ item.schoolName }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="19" :xs="24">
        <el-card shadow="never" class="search-wrapper mb-4">
          <el-form :inline="true" :model="queryParams">
            <el-form-item label="学生姓名">
              <el-input v-model="queryParams.studentName" placeholder="请输入姓名" clearable style="width: 150px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="专业名称">
              <el-input v-model="queryParams.majorName" placeholder="请输入专业" clearable style="width: 150px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="毕业届别">
              <el-input
                  v-model="queryParams.graduationYear"
                  placeholder="如: 2026"
                  clearable
                  style="width: 120px"
                  type="number"
                  @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="就业状态">
              <el-select v-model="queryParams.employmentStatus" placeholder="全部" clearable style="width: 120px">
                <el-option
                    v-for="item in empStatusOptions"
                    :key="item.id"
                    :label="item.dictLabel"
                    :value="item.dictValue"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
              <el-button :icon="Refresh" @click="handleReset">重置</el-button>
            </el-form-item>

            <el-form-item style="float: right">
              <el-button type="warning" plain :icon="Download" @click="handleExport">导出数据</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never">
          <div class="mb-4 flex items-center text-sm bg-blue-50 p-2 rounded border border-blue-100 text-blue-800">
            <el-icon class="mr-2"><Monitor /></el-icon>
            <span v-if="currentSchoolId">
              当前学校：<span class="font-bold mx-1">{{ currentSchoolName }}</span>
            </span>
            <span v-else>
              当前范围：<span class="font-bold mx-1">全平台</span>
            </span>
            <span class="ml-auto text-xs text-gray-500">共 {{ total }} 条档案数据</span>
          </div>

          <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
            <el-table-column type="index" label="#" width="50" align="center" />

            <el-table-column prop="studentName" label="学生姓名" width="120" align="center" fixed="left">
              <template #default="{ row }">
                <span class="font-bold text-gray-700">{{ row.studentName }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="studentNo" label="学号" width="140" align="center">
              <template #default="{ row }">
                <span class="font-mono text-gray-600">{{ row.studentNo }}</span>
              </template>
            </el-table-column>

            <el-table-column label="所属学校" min-width="160" show-overflow-tooltip v-if="!currentSchoolId">
              <template #default="{ row }">
                <div class="text-gray-600">{{ getSchoolName(row.schoolId) }}</div>
              </template>
            </el-table-column>

            <el-table-column prop="collegeName" label="所属院系" min-width="150" show-overflow-tooltip />

            <el-table-column prop="majorName" label="专业名称" min-width="150" show-overflow-tooltip />

            <el-table-column label="学历 / 届别" width="140" align="center">
              <template #default="{ row }">
                <span>{{ row.education }}</span>
                <span class="mx-1 text-gray-300">|</span>
                <span>{{ row.graduationYear }}届</span>
              </template>
            </el-table-column>

            <el-table-column label="就业状态" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getEmpStatusType(row.employmentStatus)" effect="plain" round>
                  {{ getEmpStatusLabel(row.employmentStatus) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="联系电话" width="140" align="center">
              <template #default="{ row }">
                <span class="font-mono text-gray-500 text-sm">{{ hidePhone(row.phone) }}</span>
              </template>
            </el-table-column>

<!--            <el-table-column label="操作" width="90" align="center" fixed="right">-->
<!--              <template #default="scope">-->
<!--                <el-button link type="primary" size="small" @click="handleDetail(scope.row)">详情</el-button>-->
<!--              </template>-->
<!--            </el-table-column>-->
          </el-table>

          <div class="mt-4 flex justify-end">
            <el-pagination
                v-model:current-page="queryParams.pageNum"
                v-model:page-size="queryParams.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleQuery"
                @current-change="handleQuery"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

<!--    <el-drawer-->
<!--        v-model="detailVisible"-->
<!--        title="学生档案详情"-->
<!--        size="40%"-->
<!--    >-->
<!--      <div v-if="detailData" class="p-4">-->
<!--        <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">-->
<!--          <div>-->
<!--            <h2 class="text-xl font-bold text-gray-800">{{ detailData.studentName }}-->
<!--              <span class="text-sm font-normal text-gray-500 ml-2">({{ detailData.studentNo }})</span>-->
<!--            </h2>-->
<!--            <p class="text-gray-500 mt-1 text-sm">-->
<!--              {{ getSchoolName(detailData.schoolId) }} · {{ detailData.majorName }}-->
<!--            </p>-->
<!--          </div>-->
<!--          <el-tag size="large" effect="dark" :type="getEmpStatusType(detailData.employmentStatus)">-->
<!--            {{ getEmpStatusLabel(detailData.employmentStatus) }}-->
<!--          </el-tag>-->
<!--        </div>-->

<!--        <el-descriptions :column="1" border size="default">-->
<!--          <el-descriptions-item label="所属院系">{{ detailData.collegeName || '-' }}</el-descriptions-item>-->
<!--          <el-descriptions-item label="行政班级">{{ detailData.className || '-' }}</el-descriptions-item>-->
<!--          <el-descriptions-item label="学历层次">{{ detailData.education || '-' }}</el-descriptions-item>-->
<!--          <el-descriptions-item label="毕业年份">{{ detailData.graduationYear }}年</el-descriptions-item>-->
<!--          <el-descriptions-item label="入学年份">{{ detailData.enrollmentYear }}年</el-descriptions-item>-->
<!--          <el-descriptions-item label="联系电话">{{ detailData.phone || '-' }}</el-descriptions-item>-->
<!--          <el-descriptions-item label="电子邮箱">{{ detailData.email || '-' }}</el-descriptions-item>-->
<!--        </el-descriptions>-->
<!--      </div>-->
<!--    </el-drawer>-->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Search, Refresh, Download, School, DataLine, Monitor
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getSchoolNameList,
  getStudentList,
  exportStudent,
  getDictData,
  type SchoolNameVo,
  type DictDataVo
} from '@/api/studentDocMgr'

// --- State ---
const loading = ref(false)
const schoolList = ref<SchoolNameVo[]>([])
const empStatusOptions = ref<DictDataVo[]>([]) // 存储字典数据
const tableData = ref<any[]>([])
const total = ref(0)
const schoolSearch = ref('')
const currentSchoolId = ref('')
const currentSchoolName = ref('')
const detailVisible = ref(false)
const detailData = ref<any>(null)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  studentName: '',
  majorName: '',
  graduationYear: '',
  employmentStatus: ''
})

// --- Computed ---
const filteredSchoolList = computed(() => {
  if (!schoolSearch.value) return schoolList.value
  return schoolList.value.filter(item => item.schoolName.includes(schoolSearch.value))
})

// --- Helpers ---
const hidePhone = (phone: string) => phone ? phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2') : '-'

const getSchoolName = (schoolId: string) => {
  const school = schoolList.value.find(s => s.id === schoolId)
  return school ? school.schoolName : '未知学校'
}

// [新增] 从字典列表中查找 Label
const getEmpStatusLabel = (status: number | string) => {
  // 这里的 status 是后端返回的 Integer (如 0, 1, 2)
  // item.dictValue 是 String (如 "0", "1", "2")
  // 使用 == 进行弱类型比较
  const found = empStatusOptions.value.find(item => item.dictValue == status)
  return found ? found.dictLabel : '未知状态'
}

// [保留] 颜色映射 (假设字典值: 0=待就业, 1=已签约, 2=升学)
const getEmpStatusType = (status: number | string) => {
  // 如果字典值不固定，这里可能需要改成根据 dictLabel 判断，或者要求字典配置时 value 固定
  const map: Record<string, string> = { '0': 'info', '1': 'success', '2': 'warning' }
  return map[String(status)] || ''
}

// --- Methods ---

const loadInitData = async () => {
  try {
    // 并行加载学校和字典
    const [resSchool, resDict] = await Promise.all([
      getSchoolNameList(),
      getDictData('sys_emp_status') // 假设你的字典类型是 sys_emp_status
    ])
    schoolList.value = resSchool.data || []
    empStatusOptions.value = resDict.data || []
  } catch (e) {
    console.error('初始化数据失败', e)
  }
}

const handleSelectSchool = (item: any) => {
  currentSchoolId.value = item.id
  currentSchoolName.value = item.schoolName
  handleQuery()
}

const getList = async () => {
  loading.value = true
  try {
    const params = {
      ...queryParams,
      schoolId: currentSchoolId.value || undefined,
      graduationYear: queryParams.graduationYear || undefined,
      employmentStatus: queryParams.employmentStatus === '' ? undefined : queryParams.employmentStatus
    }

    const res = await getStudentList(params)
    tableData.value = res.data?.data || []
    total.value = res.data?.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleQuery = () => { queryParams.pageNum = 1; getList() }
const handleReset = () => {
  queryParams.studentName = ''
  queryParams.majorName = ''
  queryParams.graduationYear = ''
  queryParams.employmentStatus = ''
  getList()
}

const handleDetail = (row: any) => {
  detailData.value = row
  detailVisible.value = true
}

const handleExport = async () => {
  try {
    ElMessage.info('正在生成报表，请稍候...')
    const res = await exportStudent(currentSchoolId.value || undefined)

    // 安全检查：如果返回的是 JSON 错误信息
    if ((res as any).type === 'application/json') {
      const reader = new FileReader()
      reader.onload = () => {
        const errorMsg = JSON.parse(reader.result as string).message
        ElMessage.error(errorMsg || '导出失败')
      }
      reader.readAsText(res as any)
      return
    }

    const blob = new Blob([res as any], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const fileName = `学生档案导出_${new Date().getTime()}.xlsx`
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('下载成功')
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadInitData() // 加载学校和字典
  getList()      // 加载列表
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
}

.left-card {
  :deep(.el-card__body) {
    height: calc(100vh - 200px);
    display: flex;
    flex-direction: column;
  }
}

.school-list-container {
  flex: 1;
  overflow-y: auto;
  margin: 0 -10px;
  padding: 0 10px;
}

.school-item {
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  color: #606266;
  font-size: 14px;

  &:hover {
    background-color: #f5f7fa;
    color: #409eff;
  }

  &.is-active {
    background-color: #ecf5ff;
    color: #409eff;
    font-weight: 600;
  }
}

.custom-scrollbar {
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #dcdfe6; border-radius: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
}
</style>