<template>
  <div class="app-container">
    <el-row :gutter="20" class="h-full">
      <el-col :span="5" :xs="24" class="mb-4">
        <el-card shadow="never" class="h-full left-card">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-bold text-gray-700">所属高校</span>
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
                <span>全平台师资</span>
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
            <el-form-item label="教师姓名">
              <el-input v-model="queryParams.name" placeholder="请输入姓名" clearable style="width: 150px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="所属院系">
              <el-input v-model="queryParams.collegeName" placeholder="院系名称" clearable style="width: 150px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="教师职称">
              <el-select v-model="queryParams.title" placeholder="全部" clearable style="width: 120px">
                <el-option
                    v-for="item in titleOptions"
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
              <el-button type="warning" plain :icon="Download" @click="handleExport">导出师资名录</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never">
          <div class="mb-4 flex items-center text-sm bg-purple-50 p-2 rounded border border-purple-100 text-purple-800">
            <el-icon class="mr-2"><UserFilled /></el-icon>
            <span v-if="currentSchoolId">
              当前展示 <span class="font-bold mx-1">{{ currentSchoolName }}</span> 的师资力量。
            </span>
            <span v-else>
              当前展示 <span class="font-bold mx-1">全平台</span> 师资力量。
            </span>
            <span class="ml-auto text-xs text-gray-500">
              数据来源：各校教务处同步 | 指标说明：评分基于学生真实评价
            </span>
          </div>

          <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
            <el-table-column type="index" label="#" width="50" align="center" />

            <el-table-column label="教师信息" width="160" fixed="left">
              <template #default="{ row }">
                <div class="flex flex-col">
                  <span class="font-bold text-gray-800 text-sm mb-1">
                    {{ row.name }}
                  </span>
                  <span class="text-xs text-gray-400 font-mono">工号: {{ row.employeeNo }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="所属学校" min-width="160" show-overflow-tooltip v-if="!currentSchoolId">
              <template #default="{ row }">
                <div class="text-gray-600 text-sm">{{ getSchoolName(row.schoolId) }}</div>
              </template>
            </el-table-column>

            <el-table-column prop="collegeName" label="所属院系" min-width="150" show-overflow-tooltip />

            <el-table-column label="职称" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getTitleTagType(row.title)" effect="plain" size="small">
                  {{ getTitleLabel(row.title) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="擅长领域" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="text-gray-600 text-xs">{{ row.expertise || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="指导项目" width="100" align="center">
              <template #default="{ row }">
                <span class="font-bold text-blue-600 font-mono">{{ row.guidanceCount || 0 }}</span>
              </template>
            </el-table-column>

            <el-table-column label="综合评分" width="100" align="center">
              <template #default="{ row }">
                <span class="font-bold text-orange-500 font-mono">{{ row.ratingScore || '5.0' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="联系邮箱" width="180" show-overflow-tooltip align="center">
              <template #default="{ row }">
                <span class="font-mono text-gray-500 text-xs">{{ hideEmail(row.email) }}</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="handleDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
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

    <el-drawer
        v-model="detailVisible"
        title="教师档案详情"
        size="40%"
    >
      <div v-if="detailData" class="p-4">
        <div class="flex items-start mb-6 pb-4 border-b border-gray-100">
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-xl font-bold text-gray-800 mb-1">
                  {{ detailData.name }}
                  <el-tag :type="getTitleTagType(detailData.title)" effect="dark" size="small" class="ml-2">
                    {{ getTitleLabel(detailData.title) }}
                  </el-tag>
                </h2>
                <p class="text-sm text-gray-500 mt-1">
                  {{ getSchoolName(detailData.schoolId) }} · {{ detailData.collegeName }}
                </p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-orange-500">{{ detailData.ratingScore || '5.0' }}</div>
                <div class="text-xs text-gray-400">综合评分</div>
              </div>
            </div>
          </div>
        </div>

        <el-descriptions :column="1" border size="default" class="mb-6">
          <el-descriptions-item label="工号">{{ detailData.employeeNo }}</el-descriptions-item>
          <el-descriptions-item label="擅长领域">
            <div class="text-blue-700 font-medium">{{ detailData.expertise || '未填写' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="累计指导">{{ detailData.guidanceCount || 0 }} 个项目/学生</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ detailData.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="电子邮箱">{{ detailData.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="入库时间">{{ detailData.createTime || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div>
          <h4 class="text-sm font-bold text-gray-700 mb-3 border-l-4 border-purple-500 pl-2">个人简介</h4>
          <div class="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded border border-gray-100 min-h-[100px]">
            {{ detailData.intro || '该教师暂未填写个人简介。' }}
          </div>
        </div>

      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Search, Refresh, Download, School, DataLine, UserFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getSchoolNameList,
  getTeacherList,
  getDictData,
  exportTeacher,
  type SchoolNameVo,
  type DictDataVo
} from '@/api/teacherDbMgr'

// --- State ---
const loading = ref(false)
const schoolList = ref<SchoolNameVo[]>([])
const titleOptions = ref<DictDataVo[]>([]) // 职称字典
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
  name: '',
  collegeName: '',
  title: ''
})

// --- Computed ---
const filteredSchoolList = computed(() => {
  if (!schoolSearch.value) return schoolList.value
  return schoolList.value.filter(item => item.schoolName.includes(schoolSearch.value))
})

// --- Helpers ---
const hideEmail = (val: string) => val ? val.replace(/(.{2}).+(.{2}@.+)/, '$1****$2') : '-'

const getSchoolName = (schoolId: string) => {
  const school = schoolList.value.find(s => s.id === schoolId)
  return school ? school.schoolName : '未知学校'
}

// 字典回显
const getTitleLabel = (val: string) => {
  const found = titleOptions.value.find(item => item.dictValue === val)
  return found ? found.dictLabel : (val || '未知')
}

// 职称颜色映射 (根据 Value)
const getTitleTagType = (val: string) => {
  const map: Record<string, string> = {
    'PROFESSOR': 'danger',
    'ASSOC_PROF': 'warning',
    'LECTURER': 'primary',
    'MENTOR': 'success'
  }
  return map[val] || 'info'
}

// --- Methods ---

const loadInitData = async () => {
  try {
    const [resSchool, resDict] = await Promise.all([
      getSchoolNameList(),
      getDictData('sys_title')
    ])
    schoolList.value = resSchool.data || []
    titleOptions.value = resDict.data || []
  } catch (e) {
    console.error('初始化失败', e)
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
      title: queryParams.title || undefined
    }

    const res = await getTeacherList(params)
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
  queryParams.name = ''
  queryParams.collegeName = ''
  queryParams.title = ''
  getList()
}

const handleDetail = (row: any) => {
  detailData.value = row
  detailVisible.value = true
}

const handleExport = async () => {
  try {
    ElMessage.info('正在生成文件，请稍候...')
    const res = await exportTeacher(currentSchoolId.value || undefined)

    // 安全检查
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
    const fileName = `教师名录导出_${new Date().getTime()}.xlsx`
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
  loadInitData()
  getList()
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