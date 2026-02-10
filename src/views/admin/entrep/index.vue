<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-wrapper mb-4">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="项目名称">
          <el-input 
            v-model="queryParams.projectName" 
            placeholder="输入项目名称搜索" 
            clearable 
            style="width: 200px"
            @keyup.enter="handleQuery" 
          />
        </el-form-item>
        
        <el-form-item label="所属学校">
          <el-select 
            v-model="queryParams.schoolId" 
            placeholder="全部学校" 
            clearable 
            style="width: 180px"
          >
            <el-option 
              v-for="school in schoolList" 
              :key="school.id" 
              :label="school.schoolName" 
              :value="school.id" 
            />
          </el-select>
        </el-form-item>

        <el-form-item label="项目领域">
          <el-select 
            v-model="queryParams.domain" 
            placeholder="全部领域" 
            clearable 
            style="width: 150px"
          >
            <el-option 
              v-for="(label, value) in domainOptions" 
              :key="value" 
              :label="label" 
              :value="value" 
            />
          </el-select>
        </el-form-item>

        <el-form-item label="项目状态">
          <el-select 
            v-model="queryParams.status" 
            placeholder="全部状态" 
            clearable 
            style="width: 120px"
          >
            <el-option label="审核中" :value="0" />
            <el-option label="孵化中" :value="1" />
            <el-option label="已驳回" :value="2" />
            <el-option label="已完结" :value="3" />
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
      <div class="mb-4 flex items-center text-sm bg-blue-50 p-2 rounded border border-blue-100 text-blue-800">
        <el-icon class="mr-2"><InfoFilled /></el-icon>
        <span>共 {{ total }} 个创业项目，其中 {{ pendingCount }} 个待审核</span>
      </div>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column type="index" label="#" width="50" align="center" />

        <el-table-column label="项目Logo" width="80" align="center">
          <template #default="{ row }">
            <el-image
              style="width: 50px; height: 50px; border-radius: 4px"
              :src="row.logo"
              fit="cover"
            >
              <template #error>
                <div class="image-slot flex items-center justify-center bg-gray-100 w-full h-full text-gray-400">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column prop="projectName" label="项目名称" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="font-bold text-gray-800">{{ row.projectName }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ row.slogan }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="schoolName" label="所属学校" width="150" show-overflow-tooltip />

        <el-table-column prop="leaderName" label="负责人" width="100" align="center" />

        <el-table-column prop="domainLabel" label="项目领域" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="info" effect="plain">{{ row.domainLabel }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="teamSize" label="团队规模" width="100" align="center">
          <template #default="{ row }">
            <span class="font-mono">{{ row.teamSize }}人</span>
          </template>
        </el-table-column>

        <el-table-column prop="mentorName" label="指导老师" width="100" align="center" />

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="warning">审核中</el-tag>
            <el-tag v-else-if="row.status === 1" type="success">孵化中</el-tag>
            <el-tag v-else-if="row.status === 2" type="danger">已驳回</el-tag>
            <el-tag v-else-if="row.status === 3" type="info">已完结</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="View" @click="handleView(row)">详情</el-button>
            
            <el-button 
              v-if="row.status === 0" 
              link 
              type="success" 
              :icon="Check" 
              @click="handleAudit(row, 1)"
            >
              通过
            </el-button>
            
            <el-button 
              v-if="row.status === 0" 
              link 
              type="danger" 
              :icon="Close" 
              @click="handleAudit(row, 2)"
            >
              驳回
            </el-button>

            <el-button 
              v-if="row.status === 1" 
              link 
              type="warning" 
              @click="handleComplete(row)"
            >
              完结
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
          @current-change="handleQuery"
        />
      </div>
    </el-card>

    <!-- 项目详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="项目详情"
      width="700px"
      append-to-body
    >
      <div v-if="currentProject" class="project-detail">
        <div class="flex gap-4 mb-4">
          <el-image 
            :src="currentProject.logo" 
            class="w-24 h-24 rounded border bg-white p-1" 
            fit="contain" 
          />
          <div class="flex-1">
            <h3 class="font-bold text-xl text-gray-800 mb-2">{{ currentProject.projectName }}</h3>
            <p class="text-gray-500 text-sm mb-2">{{ currentProject.slogan }}</p>
            <div class="flex gap-2">
              <el-tag type="info">{{ currentProject.domainLabel }}</el-tag>
              <el-tag v-if="currentProject.status === 0" type="warning">审核中</el-tag>
              <el-tag v-else-if="currentProject.status === 1" type="success">孵化中</el-tag>
              <el-tag v-else-if="currentProject.status === 2" type="danger">已驳回</el-tag>
              <el-tag v-else-if="currentProject.status === 3" type="info">已完结</el-tag>
            </div>
          </div>
        </div>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="所属学校">{{ currentProject.schoolName }}</el-descriptions-item>
          <el-descriptions-item label="项目负责人">{{ currentProject.leaderName }}</el-descriptions-item>
          <el-descriptions-item label="指导老师">{{ currentProject.mentorName }}</el-descriptions-item>
          <el-descriptions-item label="团队规模">{{ currentProject.teamSize }}人</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ currentProject.createTime }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">项目描述</el-divider>
        <div class="bg-gray-50 p-4 rounded text-sm text-gray-700 leading-relaxed">
          {{ currentProject.description || '暂无描述' }}
        </div>

        <el-divider content-position="left">需求说明</el-divider>
        <div class="bg-gray-50 p-4 rounded text-sm text-gray-700 leading-relaxed">
          {{ currentProject.needs || '暂无需求说明' }}
        </div>

        <div v-if="currentProject.status === 2 && currentProject.auditReason" class="mt-4">
          <el-divider content-position="left">驳回原因</el-divider>
          <div class="bg-red-50 p-4 rounded text-sm text-red-600">
            {{ currentProject.auditReason }}
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, Refresh, View, Check, Close, Picture, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getProjectList, 
  auditProject, 
  completeProject,
  getSchoolList,
  getProjectDomains,
  type ProjectQuery 
} from '@/api/entrep'

// --- State ---
const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const detailVisible = ref(false)
const currentProject = ref<any>(null)

// 学校列表
const schoolList = ref<any[]>([])

// 项目领域选项
const domainOptions = ref<Record<string, string>>({})

// 查询参数
const queryParams = reactive<ProjectQuery>({
  pageNum: 1,
  pageSize: 10,
  projectName: '',
  schoolId: '',
  domain: '',
  status: null
})

// 计算待审核数量
const pendingCount = computed(() => {
  return tableData.value.filter(item => item.status === 0).length
})

// --- Methods ---

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getProjectList(queryParams)
    tableData.value = res.data?.data || []
    total.value = res.data?.total || 0
  } catch (error) {
    console.error('获取项目列表失败', error)
    ElMessage.error('获取项目列表失败')
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
  queryParams.projectName = ''
  queryParams.schoolId = ''
  queryParams.domain = ''
  queryParams.status = null
  handleQuery()
}

// 查看详情
const handleView = (row: any) => {
  currentProject.value = row
  detailVisible.value = true
}

// 审核项目
const handleAudit = async (row: any, status: number) => {
  const actionText = status === 1 ? '通过' : '驳回'
  
  if (status === 2) {
    // 驳回需要填写原因
    ElMessageBox.prompt('请输入驳回原因', '驳回项目', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '驳回原因不能为空'
    }).then(async ({ value }) => {
      try {
        await auditProject({ projectId: row.projectId, status, reason: value })
        ElMessage.success(`已${actionText}`)
        getList()
      } catch (error) {
        console.error('审核失败', error)
      }
    }).catch(() => {})
  } else {
    // 通过直接确认
    ElMessageBox.confirm(`确定${actionText}项目【${row.projectName}】吗？`, '审核确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }).then(async () => {
      try {
        await auditProject({ projectId: row.projectId, status })
        ElMessage.success(`已${actionText}`)
        getList()
      } catch (error) {
        console.error('审核失败', error)
      }
    }).catch(() => {})
  }
}

// 完结项目
const handleComplete = (row: any) => {
  ElMessageBox.confirm(`确定将项目【${row.projectName}】标记为已完结吗？`, '完结项目', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await completeProject(row.projectId)
      ElMessage.success('项目已完结')
      getList()
    } catch (error) {
      console.error('完结失败', error)
    }
  }).catch(() => {})
}

// 初始化数据
const initData = async () => {
  try {
    // 并行加载学校列表和领域字典
    const [schoolRes, domainRes] = await Promise.all([
      getSchoolList(),
      getProjectDomains()
    ])
    
    schoolList.value = schoolRes.data || []
    domainOptions.value = domainRes.data || {}
  } catch (error) {
    console.error('初始化数据失败', error)
  }
}

onMounted(() => {
  initData()
  getList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.project-detail {
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
