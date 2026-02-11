<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="标题">
          <el-input v-model="queryParams.noticeTitle" placeholder="请输入标题" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryParams.noticeType" placeholder="请选择类型" clearable style="width: 150px">
            <el-option label="通知" value="1" />
            <el-option label="公告" value="2" />
            <el-option label="政策" value="3" />
            <el-option label="新闻" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="草稿" :value="0" />
            <el-option label="已发布" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card shadow="never" class="mb-4">
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增公告</el-button>
    </el-card>

    <!-- 列表 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="noticeList" style="width: 100%">
        <el-table-column prop="noticeTitle" label="标题" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="flex items-center">
              <el-tag v-if="row.isTop === 1" type="danger" size="small" class="mr-2">置顶</el-tag>
              <span>{{ row.noticeTitle }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="noticeType" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getNoticeTypeTag(row.noticeType)" size="small">
              {{ getNoticeTypeLabel(row.noticeType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="阅读量" width="100" align="center">
          <template #default="{ row }">
            <span class="text-blue-500">{{ row.viewCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="180" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              v-if="row.status === 0" 
              link 
              type="success" 
              size="small" 
              @click="handlePublish(row)"
            >
              发布
            </el-button>
            <el-button 
              v-if="row.status === 1" 
              link 
              type="warning" 
              size="small" 
              @click="handleUnpublish(row)"
            >
              停用
            </el-button>
            <el-button 
              link 
              :type="row.isTop === 1 ? 'warning' : 'primary'" 
              size="small" 
              @click="handleToggleTop(row)"
            >
              {{ row.isTop === 1 ? '取消置顶' : '置顶' }}
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="标题" prop="noticeTitle">
          <el-input v-model="formData.noticeTitle" placeholder="请输入标题" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="类型" prop="noticeType">
          <el-select v-model="formData.noticeType" placeholder="请选择类型" style="width: 100%">
            <el-option label="通知" value="1" />
            <el-option label="公告" value="2" />
            <el-option label="政策" value="3" />
            <el-option label="新闻" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="noticeContent">
          <el-input
            v-model="formData.noticeContent"
            type="textarea"
            :rows="10"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item label="是否置顶">
          <el-switch v-model="formData.isTop" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="info" @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handleSaveAndPublish">保存并发布</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="公告详情" width="800px">
      <div v-if="currentNotice" class="notice-detail">
        <div class="detail-item">
          <span class="label">标题：</span>
          <span class="value">{{ currentNotice.noticeTitle }}</span>
          <el-tag v-if="currentNotice.isTop === 1" type="danger" size="small" class="ml-2">置顶</el-tag>
        </div>
        <div class="detail-item">
          <span class="label">类型：</span>
          <el-tag :type="getNoticeTypeTag(currentNotice.noticeType)" size="small">
            {{ getNoticeTypeLabel(currentNotice.noticeType) }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <el-tag :type="currentNotice.status === 1 ? 'success' : 'info'" size="small">
            {{ currentNotice.status === 1 ? '已发布' : '草稿' }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="label">阅读量：</span>
          <span class="value text-blue-500">{{ currentNotice.viewCount }}</span>
        </div>
        <div class="detail-item">
          <span class="label">发布时间：</span>
          <span class="value">{{ currentNotice.publishTime || '未发布' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">创建时间：</span>
          <span class="value">{{ currentNotice.createTime }}</span>
        </div>
        <el-divider />
        <div class="detail-content">
          <div class="label mb-2">内容：</div>
          <div class="content-box">{{ currentNotice.noticeContent }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import {
  getNoticeList,
  addNotice,
  updateNotice,
  deleteNotice,
  publishNotice,
  unpublishNotice,
  toggleTopNotice,
  type NoticeQuery,
  type NoticeItem,
  type NoticeForm
} from '@/api/notice'

// --- 查询参数 ---
const queryParams = reactive<NoticeQuery>({
  pageNum: 1,
  pageSize: 10,
  noticeTitle: '',
  noticeType: null,
  status: null
})

// --- 列表数据 ---
const loading = ref(false)
const noticeList = ref<NoticeItem[]>([])
const total = ref(0)

// --- 对话框 ---
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const formData = reactive<NoticeForm>({
  noticeId: '',
  noticeTitle: '',
  noticeType: '',
  noticeContent: '',
  isTop: 0
})

const formRules = {
  noticeTitle: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  noticeType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  noticeContent: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

// --- 查看详情 ---
const viewDialogVisible = ref(false)
const currentNotice = ref<NoticeItem | null>(null)

// --- 加载列表 ---
const loadList = async () => {
  loading.value = true
  try {
    const res = await getNoticeList(queryParams)
    // 后端返回的是 data.data，不是 data.list
    noticeList.value = res.data.data || []
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
  queryParams.noticeTitle = ''
  queryParams.noticeType = null
  queryParams.status = null
  handleQuery()
}

// --- 新增 ---
const handleAdd = () => {
  dialogTitle.value = '新增公告'
  resetForm()
  dialogVisible.value = true
}

// --- 编辑 ---
const handleEdit = (row: NoticeItem) => {
  dialogTitle.value = '编辑公告'
  Object.assign(formData, {
    noticeId: row.noticeId,
    noticeTitle: row.noticeTitle,
    noticeType: row.noticeType,
    noticeContent: row.noticeContent,
    isTop: row.isTop
  })
  dialogVisible.value = true
}

// --- 查看 ---
const handleView = (row: NoticeItem) => {
  currentNotice.value = row
  viewDialogVisible.value = true
}

// --- 保存草稿 ---
const handleSaveDraft = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      const data = { ...formData, status: 0 }
      if (formData.noticeId) {
        await updateNotice(data)
        ElMessage.success('保存成功')
      } else {
        await addNotice(data)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      loadList()
    } catch (error) {
      console.error('保存失败', error)
      ElMessage.error('保存失败')
    }
  })
}

// --- 保存并发布 ---
const handleSaveAndPublish = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      const data = { ...formData, status: 1 }
      if (formData.noticeId) {
        await updateNotice(data)
        ElMessage.success('保存并发布成功')
      } else {
        await addNotice(data)
        ElMessage.success('新增并发布成功')
      }
      dialogVisible.value = false
      loadList()
    } catch (error) {
      console.error('保存失败', error)
      ElMessage.error('保存失败')
    }
  })
}

// --- 发布 ---
const handlePublish = async (row: NoticeItem) => {
  try {
    await ElMessageBox.confirm('确认发布该公告吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await publishNotice(row.noticeId)
    ElMessage.success('发布成功')
    loadList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发布失败', error)
      ElMessage.error('发布失败')
    }
  }
}

// --- 停用 ---
const handleUnpublish = async (row: NoticeItem) => {
  try {
    await ElMessageBox.confirm('确认停用该公告吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await unpublishNotice(row.noticeId)
    ElMessage.success('停用成功')
    loadList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('停用失败', error)
      ElMessage.error('停用失败')
    }
  }
}

// --- 置顶/取消置顶 ---
const handleToggleTop = async (row: NoticeItem) => {
  try {
    await toggleTopNotice(row.noticeId, row.isTop === 1 ? 0 : 1)
    ElMessage.success(row.isTop === 1 ? '取消置顶成功' : '置顶成功')
    loadList()
  } catch (error) {
    console.error('操作失败', error)
    ElMessage.error('操作失败')
  }
}

// --- 删除 ---
const handleDelete = async (row: NoticeItem) => {
  try {
    await ElMessageBox.confirm('确认删除该公告吗？删除后无法恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    await deleteNotice(row.noticeId)
    ElMessage.success('删除成功')
    loadList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
      ElMessage.error('删除失败')
    }
  }
}

// --- 重置表单 ---
const resetForm = () => {
  formData.noticeId = ''
  formData.noticeTitle = ''
  formData.noticeType = ''
  formData.noticeContent = ''
  formData.isTop = 0
  formRef.value?.clearValidate()
}

// --- 关闭对话框 ---
const handleDialogClose = () => {
  resetForm()
}

// --- 工具函数 ---
const getNoticeTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    '1': '通知',
    '2': '公告',
    '3': '政策',
    '4': '新闻'
  }
  return map[type] || '未知'
}

const getNoticeTypeTag = (type: string) => {
  const map: Record<string, string> = {
    '1': 'primary',
    '2': 'success',
    '3': 'warning',
    '4': 'info'
  }
  return map[type] || ''
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

.notice-detail {
  .detail-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    font-size: 14px;

    .label {
      color: #606266;
      font-weight: 500;
      min-width: 80px;
    }

    .value {
      color: #303133;
      flex: 1;
    }
  }

  .detail-content {
    .label {
      color: #606266;
      font-weight: 500;
      font-size: 14px;
    }

    .content-box {
      padding: 16px;
      background-color: #f5f7fa;
      border-radius: 4px;
      min-height: 200px;
      line-height: 1.8;
      color: #303133;
    }
  }
}
</style>
