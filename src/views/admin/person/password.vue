<template>
  <div class="app-container">
    <el-card shadow="never" style="max-width: 600px; margin: 0 auto">
      <template #header>
        <div class="flex items-center">
          <el-icon class="mr-2 text-orange-500"><Lock /></el-icon>
          <span class="font-bold">修改密码</span>
        </div>
      </template>

      <el-alert
        title="密码安全提示"
        type="warning"
        :closable="false"
        class="mb-4"
      >
        <template #default>
          <div class="text-sm">
            <p>• 密码长度至少6位</p>
            <p>• 建议使用字母、数字、符号组合</p>
            <p>• 修改密码后需要重新登录</p>
          </div>
        </template>
      </el-alert>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="formData.oldPassword"
            type="password"
            placeholder="请输入旧密码"
            show-password
            autocomplete="off"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="formData.newPassword"
            type="password"
            placeholder="请输入新密码（至少6位）"
            show-password
            autocomplete="off"
          />
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            autocomplete="off"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确认修改
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import { changePassword } from '@/api/user'
import { useUserStore } from '@/store/userStore'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 自定义验证：确认密码
const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== formData.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const formRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 提交修改
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      // 获取当前用户ID
      const userId = userStore.userInfo?.id || ''
      
      await changePassword({
        userId,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      })
      
      ElMessage.success('密码修改成功，请重新登录')
      
      // 延迟1秒后退出登录
      setTimeout(() => {
        userStore.logout()
        router.push('/login')
      }, 1000)
    } catch (error: any) {
      console.error('修改密码失败', error)
      const errorMsg = error?.response?.data?.message || '修改密码失败'
      ElMessage.error(errorMsg)
    } finally {
      submitting.value = false
    }
  })
}

// 重置表单
const handleReset = () => {
  formData.oldPassword = ''
  formData.newPassword = ''
  formData.confirmPassword = ''
  formRef.value?.clearValidate()
}

// 返回
const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}
</style>
