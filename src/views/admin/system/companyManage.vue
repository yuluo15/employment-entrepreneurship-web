<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper mb-4">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="企业名称">
          <el-input v-model="queryParams.name" placeholder="搜索企业名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="信用代码">
          <el-input v-model="queryParams.code" placeholder="输入统一社会信用代码" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="待审核" :value="0" />
            <el-option label="正常" :value="1" />
            <el-option label="已驳回" :value="2" />
            <el-option label="冻结" :value="9" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <div class="mb-4 flex items-center text-sm text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
        <el-icon class="mr-2 text-blue-500"><InfoFilled /></el-icon>
        提示：企业入驻现已改为“自主注册制”，管理员仅需在此页面进行 <span class="font-bold mx-1">资质审核</span> 与 <span class="font-bold mx-1">违规封禁</span>。
      </div>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column type="index" label="#" width="50" align="center" />

        <el-table-column label="Logo" width="70" align="center">
          <template #default="scope">
            <el-image
                style="width: 40px; height: 40px; border-radius: 4px"
                :src="scope.row.logo"
                fit="cover"
            >
              <template #error>
                <div class="bg-gray-100 w-full h-full flex items-center justify-center text-gray-400">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="企业名称" min-width="180" show-overflow-tooltip />

        <el-table-column prop="code" label="统一社会信用代码" width="180" align="center">
          <template #default="scope">
            <span class="font-mono text-xs">{{ scope.row.code }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="email" label="登录邮箱" width="180" align="center" show-overflow-tooltip>
          <template #default="scope">
            <div class="flex items-center justify-center">
              <el-icon class="mr-1 text-gray-400"><Message /></el-icon>
              <span>{{ scope.row.email }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="industry" label="所属行业" width="120" show-overflow-tooltip />

        <el-table-column label="联系人" width="160">
          <template #default="scope">
            <div><el-icon><User /></el-icon> {{ scope.row.contactPerson }}</div>
            <div class="text-gray-400 text-xs"><el-icon><Phone /></el-icon> {{ scope.row.contactPhone }}</div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success">正常</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="danger">已驳回</el-tag>
            <el-tag v-else-if="scope.row.status === 9" type="info">已冻结</el-tag>
            <el-tag v-else type="info">未知</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <el-button
                v-if="scope.row.status === 0"
                link type="primary"
                :icon="Stamp"
                @click="handleAudit(scope.row)"
            >
              审核
            </el-button>

            <template v-if="scope.row.status === 1">
              <el-button link type="primary" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button link type="warning" :icon="Lock" @click="handleFreeze(scope.row)">冻结</el-button>
            </template>

            <el-button v-if="scope.row.status === 9" link type="success" :icon="Unlock" @click="handleUnfreeze(scope.row)">解冻</el-button>

            <el-button v-if="scope.row.status !== 0" link type="info" :icon="View" @click="handleView(scope.row)">详情</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">移除</el-button>
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

    <el-dialog
        v-model="dialogVisible"
        title="编辑企业信息"
        width="750px"
        append-to-body
        destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="企业Logo" prop="logo">
              <el-upload
                  class="avatar-uploader"
                  :action="uploadApiUrl"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="handleLogoSuccess"
                  :before-upload="beforeUpload"
              >
                <img v-if="form.logo" :src="form.logo" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="营业执照" prop="licenseUrl">
              <el-upload
                  class="avatar-uploader license-uploader"
                  :action="uploadApiUrl"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="handleLicenseSuccess"
                  :before-upload="beforeUpload"
              >
                <img v-if="form.licenseUrl" :src="form.licenseUrl" class="avatar license-img" />
                <div v-else class="upload-placeholder">
                  <el-icon class="avatar-uploader-icon"><UploadFilled /></el-icon>
                  <div class="text-xs text-gray-400 mt-2">上传营业执照</div>
                </div>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="企业名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入企业全称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="信用代码" prop="code">
              <el-input
                  v-model="form.code"
                  placeholder="18位统一社会信用代码"
                  maxlength="18"
                  show-word-limit
                  disabled
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="企业邮箱">
          <el-input v-model="form.email" disabled>
            <template #prefix><el-icon><Message /></el-icon></template>
          </el-input>
          <div class="text-gray-400 text-xs mt-1">邮箱作为登录账号不可修改</div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属行业" prop="industry">
              <el-select v-model="form.industry" placeholder="请选择" class="w-full">
                <el-option label="互联网/IT" value="互联网/IT" />
                <el-option label="金融/银行" value="金融/银行" />
                <el-option label="教育/培训" value="教育/培训" />
                <el-option label="制造/实业" value="制造/实业" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="人员规模" prop="scale">
              <el-select v-model="form.scale" placeholder="请选择" class="w-full">
                <el-option label="0-20人" value="0-20人" />
                <el-option label="20-99人" value="20-99人" />
                <el-option label="100-499人" value="100-499人" />
                <el-option label="500人以上" value="500人以上" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人" prop="contactPerson">
              <el-input v-model="form.contactPerson" placeholder="业务对接人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="手机或座机" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="详细地址" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>

        <el-form-item label="企业简介" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入企业简介..." />
        </el-form-item>

      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">保存修改</el-button>
      </template>
    </el-dialog>

    <el-dialog
        v-model="auditVisible"
        :title="isAuditMode ? '企业资质审核' : '企业详情'"
        width="700px"
        append-to-body
    >
      <div class="audit-container">
        <div class="flex gap-4 mb-4">
          <el-image :src="currentCompany.logo" class="w-24 h-24 rounded border bg-white p-1" fit="contain" />
          <div class="flex-1">
            <h3 class="font-bold text-xl text-gray-800 flex items-center">
              {{ currentCompany.name }}
              <el-tag v-if="currentCompany.status === 1" type="success" class="ml-2">正常</el-tag>
              <el-tag v-else-if="currentCompany.status === 2" type="danger" class="ml-2">已驳回</el-tag>
              <el-tag v-else-if="currentCompany.status === 9" type="info" class="ml-2">已冻结</el-tag>
              <el-tag v-else type="warning" class="ml-2">待审核</el-tag>
            </h3>
            <div class="text-sm text-gray-500 mt-2 font-mono">
              信用代码：{{ currentCompany.code }}
            </div>
            <div class="text-sm text-gray-500 mt-1 grid grid-cols-2 gap-2">
              <span>行业：{{ currentCompany.industry }}</span>
              <span>规模：{{ currentCompany.scale }}</span>
              <span>联系人：{{ currentCompany.contactPerson }}</span>
              <span>电话：{{ currentCompany.contactPhone }}</span>
            </div>
            <div class="text-sm text-gray-500 mt-2">
              地址：{{ currentCompany.address || '暂无地址' }}
            </div>
          </div>
        </div>

        <div class="bg-gray-50 p-3 rounded text-sm text-gray-600 mb-4 leading-relaxed">
          <span class="font-bold text-gray-800">企业简介：</span>
          {{ currentCompany.description || '暂无简介' }}
        </div>

        <el-divider content-position="left">营业执照核验</el-divider>

        <div class="text-center bg-gray-50 p-6 rounded mb-4 border border-dashed border-gray-300">
          <el-image
              v-if="currentCompany.licenseUrl"
              :src="currentCompany.licenseUrl"
              :preview-src-list="[currentCompany.licenseUrl]"
              class="h-64 cursor-zoom-in"
              fit="contain"
          />
          <div v-else class="py-10 text-gray-400 flex flex-col items-center">
            <el-icon class="text-4xl mb-2"><Picture /></el-icon>
            <span>该企业暂未上传营业执照</span>
          </div>
        </div>

        <div v-if="!isAuditMode && currentCompany.status === 2" class="bg-red-50 p-4 rounded text-red-600 text-sm">
          <span class="font-bold">驳回原因：</span> {{ currentCompany.auditReason || '未填写原因' }}
        </div>
      </div>

      <template #footer>
        <div v-if="isAuditMode" class="flex justify-between w-full">
          <el-button @click="auditVisible = false">取消</el-button>
          <div>
            <el-button type="danger" :icon="Close" @click="handleRejectAction">驳回</el-button>
            <el-button type="success" :icon="Check" @click="handlePassAction">通过审核</el-button>
          </div>
        </div>
        <div v-else>
          <el-button @click="auditVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, Refresh, Edit, Delete, Picture, User, Phone, Stamp, View, UploadFilled, Check, Close, Key, Lock, Unlock, Message, InfoFilled, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadProps } from 'element-plus'
import { useUserStore } from '@/store/userStore'
import {
  getCompanyList, updateCompany, deleteCompany, updateCompanyStatus, auditCompany,
  type CompanyQuery
} from '@/api/company'

const userStore = useUserStore()
const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const total = ref(0)

const dialogVisible = ref(false)
// const dialogType = ref('edit') // 现在只有 edit 了
const auditVisible = ref(false)
const isAuditMode = ref(false)

const formRef = ref()
const queryParams = reactive<CompanyQuery>({
  pageNum: 1, pageSize: 10, name: '', code: '', status: null
})

const form = reactive({
  id: '', name: '', code: '', logo: '', licenseUrl: '', industry: '', scale: '',
  contactPerson: '', contactPhone: '', email: '', address: '', description: ''
})

const currentCompany = ref<any>({})

const rules = computed(() => {
  return {
    name: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
    logo: [{ required: true, message: '请上传Logo', trigger: 'change' }],
    contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
  }
})

const uploadApiUrl = '/api/common/upload'
const uploadHeaders = computed(() => ({ 'Authorization': userStore.token }))
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  if (file.size / 1024 / 1024 > 5) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}
const handleLogoSuccess = (res: any) => { form.logo = res.data }
const handleLicenseSuccess = (res: any) => { form.licenseUrl = res.data }

// --- 方法 ---

const getList = async () => {
  loading.value = true
  try {
    const res = await getCompanyList(queryParams)
    tableData.value = res.data?.data || []
    total.value = res.data?.total || 0
  } finally { loading.value = false }
}

const handleQuery = () => { queryParams.pageNum = 1; getList() }
const handleReset = () => {
  queryParams.name = ''; queryParams.code = ''; queryParams.status = null;
  handleQuery()
}

const handleFreeze = (row: any) => {
  ElMessageBox.confirm(`确定要冻结企业【${row.name}】吗？冻结后将无法登录。`, '警告', { type: 'warning' })
      .then(async () => {
        await updateCompanyStatus({ id: row.id, status: 9 })
        ElMessage.success('已冻结')
        getList()
      })
}

const handleUnfreeze = (row: any) => {
  ElMessageBox.confirm(`确定要解冻企业【${row.name}】吗？`, '提示', { type: 'success' })
      .then(async () => {
        await updateCompanyStatus({ id: row.id, status: 1 })
        ElMessage.success('已解冻')
        getList()
      })
}

// 只剩下 Edit
const handleEdit = (row: any) => {
  dialogVisible.value = true
  if(formRef.value) formRef.value.resetFields()
  Object.assign(form, row)
}

const submitForm = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitLoading.value = true
      try {
        await updateCompany(form)
        ElMessage.success('操作成功')
        dialogVisible.value = false
        getList()
      } finally { submitLoading.value = false }
    }
  })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定移除该企业吗？(逻辑删除)', '警告', { type: 'error' })
      .then(async () => {
        await deleteCompany(row.id)
        ElMessage.success('删除成功')
        getList()
      })
}

// --- 审核 ---
const handleAudit = (row: any) => {
  currentCompany.value = row
  isAuditMode.value = true
  auditVisible.value = true
}

const handleView = (row: any) => {
  currentCompany.value = row
  isAuditMode.value = false
  auditVisible.value = true
}

const handlePassAction = async () => {
  ElMessageBox.confirm(`确定通过【${currentCompany.value.name}】的入驻申请吗？`, '审核确认', { type: 'success' })
      .then(async () => {
        submitLoading.value = true
        try {
          await auditCompany({ id: currentCompany.value.id, status: 1 })
          ElMessage.success('审核通过')
          auditVisible.value = false
          getList()
        } finally { submitLoading.value = false }
      })
}

const handleRejectAction = () => {
  ElMessageBox.prompt('请输入驳回原因', '驳回申请', { inputPattern: /\S+/, inputErrorMessage: '原因不能为空' })
      .then(async ({ value }) => {
        submitLoading.value = true
        try {
          await auditCompany({ id: currentCompany.value.id, status: 2, reason: value })
          ElMessage.success('已驳回')
          auditVisible.value = false
          getList()
        } finally { submitLoading.value = false }
      })
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}
.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    &:hover { border-color: var(--el-color-primary); }
  }
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}
.license-uploader {
  .avatar-uploader-icon { width: 150px; height: 100px; line-height: 100px; }
  .license-img { width: 150px; height: 100px; object-fit: contain; }
  .upload-placeholder {
    width: 150px; height: 100px; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    .avatar-uploader-icon { width: auto; height: auto; line-height: 1; font-size: 24px; }
  }
}
</style>