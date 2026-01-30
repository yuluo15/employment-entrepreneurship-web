<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper mb-4">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="学校名称">
          <el-input v-model="queryParams.name" placeholder="输入学校名称搜索" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
        <el-form-item style="float: right">
          <el-button type="info" plain :icon="Delete" @click="handleOpenRecycle" class="mr-2">回收站</el-button>
          <el-button type="success" :icon="Plus" @click="handleAdd">新增入驻学校</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column type="index" label="#" width="50" align="center" />

        <el-table-column label="学校Logo" width="100" align="center">
          <template #default="scope">
            <el-image
                style="width: 40px; height: 40px; border-radius: 4px"
                :src="scope.row.logo"
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

        <el-table-column prop="name" label="学校名称" min-width="180" show-overflow-tooltip />

        <el-table-column prop="code" label="院校代码" width="120" align="center">
          <template #default="scope">
            <el-tag type="info" effect="plain">{{ scope.row.code }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="email" label="登录邮箱" width="200" align="center" show-overflow-tooltip>
          <template #default="scope">
            <div class="flex items-center justify-center">
              <el-icon class="mr-1 text-gray-400"><Message /></el-icon>
              <span>{{ scope.row.email }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="contactPhone" label="联系电话" width="150" align="center" />
        <el-table-column prop="createTime" label="入驻时间" width="180" align="center" />

        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-switch
                v-model="scope.row.status"
                :active-value="1"
                :inactive-value="0"
                inline-prompt
                active-text="正常"
                inactive-text="停用"
                :loading="scope.row.statusLoading"
                :before-change="() => handleBeforeStatusChange(scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="warning" :icon="Key" @click="handleResetPwd(scope.row)">重置密码</el-button>
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
        :title="dialogType === 'add' ? '新增入驻学校' : '编辑学校信息'"
        width="600px"
        append-to-body
        destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">

        <el-form-item label="学校Logo" prop="logo">
          <el-upload
              class="avatar-uploader"
              :action="uploadApiUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              name="file"
          >
            <img v-if="form.logo" :src="form.logo" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip text-center">
                建议上传 1:1 比例 (PNG/JPG)，大小不超过 2MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="学校名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入学校全称" />
        </el-form-item>

        <el-form-item label="院校代码" prop="code">
          <el-input
              v-model="form.code"
              placeholder="例如：10001"
              :disabled="dialogType === 'edit'"
              style="width: 200px"
          />
          <span class="text-gray-400 text-xs ml-2" v-if="dialogType === 'add'">
            * 唯一标识，不可修改
          </span>
        </el-form-item>

        <el-form-item label="学校邮箱" prop="email">
          <el-input
              v-model="form.email"
              placeholder="作为管理员登录账号"
              :disabled="dialogType === 'edit'"
          >
            <template #prefix><el-icon><Message /></el-icon></template>
          </el-input>
          <div class="text-gray-400 text-xs mt-1" v-if="dialogType === 'add'">
            * 初始密码默认为 123456
          </div>
        </el-form-item>

        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="手机号或座机号" style="width: 200px" />
        </el-form-item>

        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" type="textarea" :rows="2" placeholder="学校详细地址" />
        </el-form-item>

        <el-form-item label="状态" v-if="dialogType === 'edit'">
          <el-tag :type="form.status === 1 ? 'success' : 'danger'">
            {{ form.status === 1 ? '正常' : '已停用' }}
          </el-tag>
          <span class="text-gray-400 text-xs ml-2">请在列表页进行启停操作</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer
        v-model="recycleVisible"
        title="学校回收站"
        direction="rtl"
        size="40%"
    >
      <div class="mb-4 text-gray-400 text-sm bg-gray-50 p-3 rounded">
        <el-icon class="mr-1"><InfoFilled /></el-icon>
        这里展示已逻辑删除的数据，点击还原可将其恢复到正常列表。
      </div>
      <el-table
          v-loading="recycleLoading"
          :data="recycleData"
          border
          stripe
          style="width: 100%"
          height="calc(100vh - 200px)"
      >
        <el-table-column prop="name" label="学校名称" show-overflow-tooltip />
        <el-table-column prop="code" label="院校代码" width="100" align="center" />
        <el-table-column prop="email" label="邮箱账号" width="180" align="center" show-overflow-tooltip />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="scope">
            <el-button
                type="success"
                link
                :icon="RefreshLeft"
                @click="handleRestore(scope.row)"
            >
              还原
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  Search, Refresh, Plus, Edit, Delete, Key, Picture,
  RefreshLeft, InfoFilled, Message // 引入图标
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadProps } from 'element-plus'
import { useUserStore } from '@/store/userStore'
import {
  getSchoolList,
  createSchool,
  updateSchool,
  deleteSchool,
  resetPassword,
  updateStatus,
  getDeletedSchoolList,
  restoreSchool,
  type SchoolQuery
} from '@/api/school'

const userStore = useUserStore()
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref()
const total = ref(0)
const tableData = ref<any[]>([])

const recycleVisible = ref(false)
const recycleLoading = ref(false)
const recycleData = ref<any[]>([])

const uploadApiUrl = '/api/common/upload'
const uploadHeaders = computed(() => ({ 'Authorization': userStore.token }))
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('图片必须是 JPG 或 PNG 格式!')
    return false
  }
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}
const handleAvatarSuccess: UploadProps['onSuccess'] = (response) => {
  if (response.code === 200 || response.message === 'success') {
    form.logo = response.data
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const queryParams = reactive<SchoolQuery>({
  pageNum: 1,
  pageSize: 10,
  name: '',
  status: null
})

// 校验函数
const validatePhone = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入联系电话'))
  }
  const mobileReg = /^1[3-9]\d{9}$/
  const landlineReg = /^0\d{2,3}-\d{7,8}$/
  if (mobileReg.test(value) || landlineReg.test(value)) {
    callback()
  } else {
    callback(new Error('请输入正确的手机号或座机号'))
  }
}

// 【新增】邮箱校验
const validateEmail = (rule: any, value: any, callback: any) => {
  const emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
  if (!value) {
    return callback(new Error('请输入学校邮箱'))
  }
  if (emailReg.test(value)) {
    callback()
  } else {
    callback(new Error('请输入正确的邮箱格式'))
  }
}

// 【修改】新增 email 字段
const form = reactive({
  id: '',
  name: '',
  code: '',
  email: '', // 必填，作为账号
  contactPhone: '',
  address: '',
  status: 1,
  logo: ''
})

const rules = {
  name: [{ required: true, message: '请输入学校名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入院校代码', trigger: 'blur' }],
  email: [{ required: true, validator: validateEmail, trigger: 'blur' }], // 邮箱必填
  logo: [{ required: true, message: '请上传学校Logo', trigger: 'change' }],
  contactPhone: [{ required: true, validator: validatePhone, trigger: 'blur' }]
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getSchoolList(queryParams)
    tableData.value = res.data?.data || []
    total.value = res.data?.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const handleReset = () => {
  queryParams.name = ''
  queryParams.status = null
  handleQuery()
}

const handleBeforeStatusChange = (row: any) => {
  return new Promise((resolve, reject) => {
    const actionText = row.status === 1 ? '停用' : '启用'
    const newStatus = row.status === 1 ? 0 : 1
    ElMessageBox.confirm(
        `确定要${actionText}【${row.name}】吗？`,
        '状态变更提示',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: row.status === 1 ? 'warning' : 'info' }
    ).then(async () => {
      row.statusLoading = true
      try {
        await updateStatus({ id: row.id, status: newStatus })
        ElMessage.success(`${actionText}成功`)
        resolve(true)
        getList()
      } catch (e) {
        reject(false)
      } finally {
        row.statusLoading = false
      }
    }).catch(() => reject(false))
  })
}

const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  if(formRef.value) formRef.value.resetFields()
  Object.assign(form, {
    id: '', name: '', code: '', email: '',
    contactPhone: '', address: '', status: 1, logo: ''
  })
}

const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  if(formRef.value) formRef.value.resetFields()
  Object.assign(form, row)
}

const submitForm = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (dialogType.value === 'add') {
          await createSchool(form)
          ElMessage.success('新增学校成功')
        } else {
          await updateSchool(form)
          ElMessage.success('更新信息成功')
        }
        dialogVisible.value = false
        getList()
      } catch (e) { } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
      `确定要将学校【${row.name}】移入回收站吗？`,
      '移入回收站',
      { type: 'warning', confirmButtonText: '确认移除', cancelButtonText: '取消' }
  ).then(async () => {
    await deleteSchool(row.id)
    ElMessage.success('移除成功')
    getList()
  }).catch(() => {})
}

const handleResetPwd = (row: any) => {
  ElMessageBox.prompt('请输入新密码', '重置密码', {
    confirmButtonText: '确定', cancelButtonText: '取消',
    inputPattern: /\S{6,}/, inputErrorMessage: '密码长度不能少于6位', inputValue: '123456'
  }).then(async ({ value }) => {
    await resetPassword({ id: row.id, newPassword: value })
    ElMessage.success('密码重置成功')
  }).catch(() => {})
}

const handleOpenRecycle = async () => {
  recycleVisible.value = true
  recycleLoading.value = true
  try {
    const res = await getDeletedSchoolList()
    recycleData.value = res.data || []
  } catch (e) {
    console.error(e)
  } finally {
    recycleLoading.value = false
  }
}

const handleRestore = async (row: any) => {
  try {
    await restoreSchool(row.id)
    ElMessage.success(`成功还原学校：${row.name}`)
    handleOpenRecycle()
    getList()
  } catch (e) {
    console.error(e)
  }
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
    transition: var(--el-transition-duration-fast);
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
</style>