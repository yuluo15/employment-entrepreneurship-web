<template>
  <div class="project-container">
    <!-- 搜索区域 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="项目名称">
          <el-input
            v-model="queryParams.projectName"
            placeholder="请输入项目名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="学生姓名">
          <el-input
            v-model="queryParams.studentName"
            placeholder="请输入学生姓名"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="项目领域">
          <el-input
            v-model="queryParams.domain"
            placeholder="请输入项目领域"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="项目状态">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择项目状态"
            clearable
            style="width: 150px"
          >
            <el-option label="待审核" value="0" />
            <el-option label="孵化中" value="1" />
            <el-option label="已驳回" value="2" />
            <el-option label="已落地" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="projectList"
        border
        stripe
      >
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="项目名称" prop="projectName" width="200" show-overflow-tooltip />
        <el-table-column label="项目Logo" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.logo"
              :src="row.logo"
              :preview-src-list="[row.logo]"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px"
            />
            <span v-else style="color: #999">暂无</span>
          </template>
        </el-table-column>
        <el-table-column label="学生姓名" prop="studentName" width="120" align="center" />
        <el-table-column label="学号" prop="studentNo" width="120" align="center" />
        <el-table-column label="项目领域" prop="domain" width="120" align="center" />
        <el-table-column label="团队规模" width="100" align="center">
          <template #default="{ row }">{{ row.teamSize }}人</template>
        </el-table-column>
        <el-table-column label="创造岗位" width="100" align="center">
          <template #default="{ row }">{{ row.jobsCreated }}个</template>
        </el-table-column>
        <el-table-column label="项目状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === '0'" type="warning">待审核</el-tag>
            <el-tag v-else-if="row.status === '1'" type="success">孵化中</el-tag>
            <el-tag v-else-if="row.status === '2'" type="danger">已驳回</el-tag>
            <el-tag v-else-if="row.status === '3'" type="info">已落地</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">查看详情</el-button>
            <el-button
              v-if="row.status === '0'"
              link
              type="success"
              @click="handleAudit(row, '1')"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === '0'"
              link
              type="danger"
              @click="handleReject(row)"
            >
              驳回
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleQuery"
        @current-change="handleQuery"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="项目详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border v-if="currentProject">
        <el-descriptions-item label="项目名称" :span="2">{{ currentProject.projectName }}</el-descriptions-item>
        <el-descriptions-item label="项目Logo" :span="2">
          <el-image
            v-if="currentProject.logo"
            :src="currentProject.logo"
            :preview-src-list="[currentProject.logo]"
            fit="cover"
            style="width: 100px; height: 100px; border-radius: 4px"
          />
          <span v-else style="color: #999">暂无</span>
        </el-descriptions-item>
        <el-descriptions-item label="项目口号" :span="2">{{ currentProject.slogan || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentProject.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentProject.studentNo }}</el-descriptions-item>
        <el-descriptions-item label="项目领域">{{ currentProject.domain }}</el-descriptions-item>
        <el-descriptions-item label="团队规模">{{ currentProject.teamSize }}人</el-descriptions-item>
        <el-descriptions-item label="创造岗位">{{ currentProject.jobsCreated }}个</el-descriptions-item>
        <el-descriptions-item label="项目状态">
          <el-tag v-if="currentProject.status === '0'" type="warning">待审核</el-tag>
          <el-tag v-else-if="currentProject.status === '1'" type="success">孵化中</el-tag>
          <el-tag v-else-if="currentProject.status === '2'" type="danger">已驳回</el-tag>
          <el-tag v-else-if="currentProject.status === '3'" type="info">已落地</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="项目需求" :span="2">{{ currentProject.needs || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="项目描述" :span="2">
          <div style="white-space: pre-wrap; line-height: 1.6">{{ currentProject.description }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="导师姓名">{{ currentProject.mentorName || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="导师评价">{{ currentProject.mentorComment || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentProject.createTime }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ currentProject.auditTime || '暂未审核' }}</el-descriptions-item>
        <el-descriptions-item v-if="currentProject.status === '2'" label="驳回原因" :span="2">
          <el-text type="danger">{{ currentProject.auditReason }}</el-text>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 驳回对话框 -->
    <el-dialog
      v-model="rejectVisible"
      title="驳回项目"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="驳回原因" required>
          <el-input
            v-model="rejectForm.auditReason"
            type="textarea"
            :rows="4"
            placeholder="请输入驳回原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReject">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import {
  getProjectList,
  getProjectDetail,
  auditProject,
  type ProjectQuery,
  type ProjectListItem,
  type ProjectDetail,
  type AuditForm
} from '@/api/school'

// 查询参数
const queryParams = reactive<ProjectQuery>({
  pageNum: 1,
  pageSize: 10,
  projectName: '',
  studentName: '',
  domain: '',
  status: ''
})

// 数据列表
const projectList = ref<ProjectListItem[]>([])
const total = ref(0)
const loading = ref(false)

// 详情对话框
const detailVisible = ref(false)
const currentProject = ref<ProjectDetail | null>(null)

// 驳回对话框
const rejectVisible = ref(false)
const rejectForm = reactive({
  projectId: '',
  auditReason: ''
})

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getProjectList(queryParams)
    projectList.value = res.data.data
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('获取项目列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  queryParams.projectName = ''
  queryParams.studentName = ''
  queryParams.domain = ''
  queryParams.status = ''
  handleQuery()
}

// 查看详情
const handleViewDetail = async (row: ProjectListItem) => {
  try {
    const res = await getProjectDetail(row.projectId)
    currentProject.value = res.data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error('获取项目详情失败')
  }
}

// 审核通过
const handleAudit = async (row: ProjectListItem, status: string) => {
  try {
    await ElMessageBox.confirm(
      '确认通过该项目审核吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const data: AuditForm = {
      projectId: row.projectId,
      status,
      auditReason: ''
    }

    await auditProject(data)
    ElMessage.success('审核成功')
    getList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('审核失败')
    }
  }
}

// 驳回
const handleReject = (row: ProjectListItem) => {
  rejectForm.projectId = row.projectId
  rejectForm.auditReason = ''
  rejectVisible.value = true
}

// 确认驳回
const confirmReject = async () => {
  if (!rejectForm.auditReason.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }

  try {
    const data: AuditForm = {
      projectId: rejectForm.projectId,
      status: '2',
      auditReason: rejectForm.auditReason
    }

    await auditProject(data)
    ElMessage.success('驳回成功')
    rejectVisible.value = false
    getList()
  } catch (error) {
    ElMessage.error('驳回失败')
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss">
.project-container {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    :deep(.el-table) {
      font-size: 14px;
    }
  }
}
</style>
