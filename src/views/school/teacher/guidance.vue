<template>
  <div class="guidance-container">
    <!-- 搜索区域 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="教师姓名">
          <el-input
            v-model="queryParams.teacherName"
            placeholder="请输入教师姓名"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input
            v-model="queryParams.projectName"
            placeholder="请输入项目名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="指导时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
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
        :data="guidanceList"
        border
        stripe
      >
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="教师姓名" prop="teacherName" width="120" align="center" />
        <el-table-column label="工号" prop="employeeNo" width="120" align="center" />
        <el-table-column label="学院" prop="collegeName" width="150" show-overflow-tooltip />
        <el-table-column label="职称" prop="title" width="100" align="center" />
        <el-table-column label="项目名称" prop="projectName" width="200" show-overflow-tooltip />
        <el-table-column label="学生姓名" prop="studentName" width="120" align="center" />
        <el-table-column label="指导内容" prop="content" min-width="300" show-overflow-tooltip />
        <el-table-column label="指导时间" prop="createTime" width="180" align="center" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">查看详情</el-button>
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
      title="指导记录详情"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border v-if="currentRecord">
        <el-descriptions-item label="教师姓名">{{ currentRecord.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="工号">{{ currentRecord.employeeNo }}</el-descriptions-item>
        <el-descriptions-item label="学院">{{ currentRecord.collegeName }}</el-descriptions-item>
        <el-descriptions-item label="职称">{{ currentRecord.title }}</el-descriptions-item>
        <el-descriptions-item label="项目名称" :span="2">{{ currentRecord.projectName }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentRecord.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentRecord.studentNo }}</el-descriptions-item>
        <el-descriptions-item label="项目领域">{{ currentRecord.domain }}</el-descriptions-item>
        <el-descriptions-item label="团队规模">{{ currentRecord.teamSize }}人</el-descriptions-item>
        <el-descriptions-item label="指导时间" :span="2">{{ currentRecord.createTime }}</el-descriptions-item>
        <el-descriptions-item label="指导内容" :span="2">
          <div style="white-space: pre-wrap; line-height: 1.6">{{ currentRecord.content }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getGuidanceList, getGuidanceDetail, type GuidanceQuery, type GuidanceListItem, type GuidanceDetail } from '@/api/school'

// 查询参数
const queryParams = reactive<GuidanceQuery>({
  pageNum: 1,
  pageSize: 10,
  teacherName: '',
  projectName: '',
  startTime: '',
  endTime: ''
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 数据列表
const guidanceList = ref<GuidanceListItem[]>([])
const total = ref(0)
const loading = ref(false)

// 详情对话框
const detailVisible = ref(false)
const currentRecord = ref<GuidanceDetail | null>(null)

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    // 处理日期范围
    if (dateRange.value && dateRange.value.length === 2) {
      queryParams.startTime = dateRange.value[0]
      queryParams.endTime = dateRange.value[1]
    } else {
      queryParams.startTime = ''
      queryParams.endTime = ''
    }

    const res = await getGuidanceList(queryParams)
    guidanceList.value = res.data.data
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('获取指导记录列表失败')
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
  queryParams.teacherName = ''
  queryParams.projectName = ''
  queryParams.startTime = ''
  queryParams.endTime = ''
  dateRange.value = null
  handleQuery()
}

// 查看详情
const handleViewDetail = async (row: GuidanceListItem) => {
  try {
    const res = await getGuidanceDetail(row.id)
    currentRecord.value = res.data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error('获取指导记录详情失败')
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss">
.guidance-container {
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
