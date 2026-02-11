<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center">
          <el-icon class="mr-2 text-blue-500"><User /></el-icon>
          <span class="font-bold">基本信息</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        style="max-width: 600px"
        v-loading="loading"
      >
        <el-form-item label="用户ID">
          <el-input v-model="formData.id" disabled />
        </el-form-item>

        <el-form-item label="登录账号">
          <el-input v-model="formData.loginIdentity" disabled />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" maxlength="50" />
        </el-form-item>

        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" maxlength="50" />
        </el-form-item>

        <el-form-item label="头像">
          <div class="flex items-center">
            <el-avatar :size="80" :src="formData.avatar || defaultAvatar" class="mr-4" />
            <el-input v-model="formData.avatar" placeholder="请输入头像URL" style="flex: 1" />
          </div>
        </el-form-item>

        <el-form-item label="性别">
          <el-radio-group v-model="formData.gender">
            <el-radio :label="0">未知</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="角色">
          <el-tag type="danger">{{ getRoleLabel(formData.roleKey) }}</el-tag>
        </el-form-item>

        <el-form-item label="账号状态">
          <el-tag :type="formData.status === 1 ? 'success' : 'danger'">
            {{ formData.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </el-form-item>

        <el-form-item label="创建时间">
          <span class="text-gray-500">{{ formData.createTime }}</span>
        </el-form-item>

        <el-form-item label="最近登录">
          <span class="text-gray-500">{{ formData.loginDate || '暂无登录记录' }}</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">保存修改</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="warning" @click="goToChangePassword">修改密码</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, FormInstance } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { getUserInfo, updateUserInfo, type UserInfo } from '@/api/user'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 表单数据
const formData = reactive<UserInfo>({
  id: '',
  loginIdentity: '',
  email: '',
  phone: '',
  nickname: '',
  realName: '',
  avatar: '',
  gender: 0,
  roleKey: '',
  ownerId: '',
  status: 1,
  createTime: '',
  loginDate: ''
})

// 原始数据备份
let originalData: UserInfo | null = null

// 表单验证规则
const formRules = {
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  nickname: [
    { max: 50, message: '昵称不能超过50个字符', trigger: 'blur' }
  ],
  realName: [
    { max: 50, message: '真实姓名不能超过50个字符', trigger: 'blur' }
  ]
}

// 加载用户信息
const loadUserInfo = async () => {
  loading.value = true
  try {
    const res = await getUserInfo()
    const data = res.data
    Object.assign(formData, data)
    originalData = { ...data }
  } catch (error) {
    console.error('加载用户信息失败', error)
    ElMessage.error('加载用户信息失败')
  } finally {
    loading.value = false
  }
}

// 提交修改
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      await updateUserInfo({
        id: formData.id,
        email: formData.email,
        phone: formData.phone,
        nickname: formData.nickname,
        realName: formData.realName,
        avatar: formData.avatar,
        gender: formData.gender
      })
      ElMessage.success('保存成功')
      loadUserInfo()
    } catch (error) {
      console.error('保存失败', error)
      ElMessage.error('保存失败')
    } finally {
      submitting.value = false
    }
  })
}

// 重置表单
const handleReset = () => {
  if (originalData) {
    Object.assign(formData, originalData)
  }
  formRef.value?.clearValidate()
}

// 跳转到修改密码页面
const goToChangePassword = () => {
  router.push({ name: 'AdminChangePassword' })
}

// 获取角色标签
const getRoleLabel = (roleKey: string) => {
  const roleMap: Record<string, string> = {
    'ROLE_ADMIN': '系统管理员',
    'ROLE_SCHOOL': '学校管理员',
    'ROLE_COMPANY': '企业管理员',
    'ROLE_TEACHER': '教师',
    'ROLE_STUDENT': '学生'
  }
  return roleMap[roleKey] || roleKey
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}
</style>
