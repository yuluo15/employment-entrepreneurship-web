<template>
  <div class="register-container">
    <div class="marketing-side">
      <div class="glass-mask">
        <div class="content">
          <img src="/1.png" alt="Logo" class="logo mb-4" />
          <h1 class="text-4xl font-bold text-white mb-4">加入高校就业联盟</h1>
          <p class="text-lg text-white/80 leading-relaxed">
            连接 50,000+ 优秀毕业生 <br>
            开启企业人才战略新篇章
          </p>
          <div class="mt-10 flex gap-4">
            <div class="stat-item">
              <h3 class="text-2xl font-bold text-white">120+</h3>
              <p class="text-sm text-white/70">合作高校</p>
            </div>
            <div class="stat-item">
              <h3 class="text-2xl font-bold text-white">50w+</h3>
              <p class="text-sm text-white/70">简历投递</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-side">
      <div class="form-wrapper">
        <div class="header mb-8">
          <h2 class="text-2xl font-bold text-gray-800">企业入驻申请</h2>
          <p class="text-gray-400 text-sm mt-1">请填写真实信息，审核通过后即可发布职位</p>
        </div>

        <el-steps :active="activeStep" finish-status="success" align-center class="mb-10 custom-steps">
          <el-step title="账号创建" />
          <el-step title="企业信息" />
          <el-step title="资质认证" />
        </el-steps>

        <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-position="top"
            size="large"
            class="register-form"
            v-if="activeStep < 3"
        >
          <div v-show="activeStep === 0" class="step-content">
            <el-form-item label="管理员邮箱" prop="adminAccount">
              <el-input
                  v-model="form.adminAccount"
                  placeholder="请输入邮箱作为登录账号"
                  :prefix-icon="Message"
              />
            </el-form-item>
            <el-form-item label="邮箱验证码" prop="emailCode">
              <div class="flex gap-2">
                <el-input
                    v-model="form.emailCode"
                    placeholder="请输入6位验证码"
                    maxlength="6"
                    class="flex-1"
                />
                <el-button
                    :disabled="countdown > 0"
                    @click="sendEmailCode"
                    style="width: 120px"
                >
                  {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
                </el-button>
              </div>
            </el-form-item>
            <el-form-item label="设置密码" prop="password">
              <el-input
                  v-model="form.password"
                  type="password"
                  show-password
                  placeholder="8-20位，包含字母和数字"
                  :prefix-icon="Lock"
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                  v-model="form.confirmPassword"
                  type="password"
                  show-password
                  placeholder="请再次输入密码"
                  :prefix-icon="Lock"
              />
            </el-form-item>
          </div>

          <div v-show="activeStep === 1" class="step-content">
            <el-form-item label="企业全称" prop="name">
              <el-input v-model="form.name" placeholder="需与营业执照名称一致" :prefix-icon="OfficeBuilding" />
            </el-form-item>
            <el-form-item label="统一社会信用代码" prop="code">
              <el-input
                  v-model="form.code"
                  placeholder="18位信用代码"
                  maxlength="18"
                  show-word-limit
                  :prefix-icon="Postcard"
              />
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
          </div>

          <div v-show="activeStep === 2" class="step-content">
            <el-form-item label="营业执照" prop="licenseUrl">
              <el-upload
                  class="license-uploader-compact"
                  :action="uploadApiUrl"
                  :show-file-list="false"
                  :on-success="handleUploadSuccess"
                  :before-upload="beforeUpload"
              >
                <div v-if="form.licenseUrl" class="uploaded-view">
                  <img :src="form.licenseUrl" class="thumb" />
                  <div class="re-upload"><el-icon><Refresh /></el-icon> 重新上传</div>
                </div>
                <div v-else class="upload-trigger">
                  <el-icon class="text-2xl text-gray-400 mr-3"><UploadFilled /></el-icon>
                  <div class="text-left">
                    <div class="text-sm text-gray-700">点击上传营业执照</div>
                    <div class="text-xs text-gray-400">支持 JPG/PNG，大小不超过 5MB</div>
                  </div>
                </div>
              </el-upload>
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="联系人姓名" prop="contactPerson">
                  <el-input v-model="form.contactPerson" placeholder="HR或负责人" :prefix-icon="User" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话" prop="contactPhone">
                  <el-input v-model="form.contactPhone" placeholder="手机或座机" :prefix-icon="Phone" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>

        <div v-if="activeStep === 3" class="success-view text-center py-10">
          <el-icon class="text-6xl text-green-500 mb-4"><SuccessFilled /></el-icon>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">提交成功</h2>
          <p class="text-gray-500 mb-8">
            您的入驻申请已提交，管理员将在 1-3 个工作日内完成审核。<br>
            审核结果将通过邮件发送至您的邮箱。
          </p>
          <el-button type="primary" size="large" class="w-48" @click="router.push('/login')">返回登录页</el-button>
        </div>

        <div v-if="activeStep < 3" class="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <div class="left-btn">
            <el-button v-if="activeStep > 0" @click="prevStep">上一步</el-button>
            <el-button v-if="activeStep === 0" link @click="router.push('/login')">已有账号？去登录</el-button>
          </div>
          <div class="right-btn">
            <el-button v-if="activeStep < 2" type="primary" @click="nextStep">下一步</el-button>
            <el-button v-if="activeStep === 2" type="primary" :loading="loading" @click="handleSubmit">提交审核</el-button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User, Lock, OfficeBuilding, Postcard, Phone, Message,
  UploadFilled, Refresh, SuccessFilled
} from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'
import { registerCompanyApi, sendEmailCodeApi } from '@/api/auth'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const activeStep = ref(0)
const countdown = ref(0)

const form = reactive({
  // Step 1
  adminAccount: '',
  emailCode: '',
  password: '',
  confirmPassword: '',
  // Step 2
  name: '',
  code: '',
  industry: '',
  scale: '',
  // Step 3
  licenseUrl: '',
  contactPerson: '',
  contactPhone: ''
})

// 邮箱格式校验
const validateEmail = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入邮箱'))
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    callback(new Error('邮箱格式不正确'))
  } else {
    callback()
  }
}

// 密码一致性校验
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  // Step 1
  adminAccount: [{ validator: validateEmail, trigger: 'blur' }],
  emailCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }, { len: 6, message: '验证码为6位', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码不能少于6位', trigger: 'blur' }],
  confirmPassword: [{ validator: validatePass2, trigger: 'blur' }],
  // Step 2
  name: [{ required: true, message: '请输入企业全称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入信用代码', trigger: 'blur' }, { min: 18, max: 18, message: '需18位字符', trigger: 'blur' }],
  industry: [{ required: true, message: '请选择所属行业', trigger: 'change' }],
  scale: [{ required: true, message: '请选择人员规模', trigger: 'change' }],
  // Step 3
  licenseUrl: [{ required: true, message: '请上传营业执照', trigger: 'change' }],
  contactPerson: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

// 步骤字段映射（用于分步校验）
const stepFields = [
  ['adminAccount', 'emailCode', 'password', 'confirmPassword'], // Step 0
  ['name', 'code', 'industry', 'scale'],                        // Step 1
  ['licenseUrl', 'contactPerson', 'contactPhone']               // Step 2
]

// 发送邮箱验证码
const sendEmailCode = async () => {
  // 先校验邮箱格式
  if (!form.adminAccount) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminAccount)) {
    ElMessage.warning('邮箱格式不正确')
    return
  }

  try {
    await sendEmailCodeApi(form.adminAccount)
    ElMessage.success('验证码已发送，请查收邮件')
    
    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败', error)
  }
}

// 下一步
const nextStep = async () => {
  if (!formRef.value) return
  // 只校验当前步骤的字段
  const currentFields = stepFields[activeStep.value]
  let valid = true
  try {
    // 逐个校验当前步骤字段
    await Promise.all(currentFields.map(field =>
        new Promise((resolve, reject) => {
          formRef.value.validateField(field, (isValid: boolean, invalidFields: any) => {
            if(!isValid) reject()
            else resolve(true)
          })
        })
    ))
  } catch {
    valid = false
  }

  if (valid) {
    activeStep.value++
  }
}

const prevStep = () => {
  if (activeStep.value > 0) activeStep.value--
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return
  // 校验最后一步
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        await registerCompanyApi(form)
        // 成功后进入结果页
        activeStep.value = 3
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 上传逻辑
const uploadApiUrl = '/api/common/upload'
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  if (file.size / 1024 / 1024 > 5) {
    ElMessage.error('文件大小不能超过 5MB!')
    return false
  }
  return true
}
const handleUploadSuccess: UploadProps['onSuccess'] = (res) => {
  if (res.code === 200) {
    form.licenseUrl = res.data
    // 手动触发校验，消除红字
    formRef.value.validateField('licenseUrl')
    ElMessage.success('上传成功')
  } else {
    ElMessage.error('上传失败')
  }
}
</script>

<style lang="scss" scoped>
.register-container {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #fff;
  overflow: hidden;
}

// 左侧营销区
.marketing-side {
  width: 35%;
  background-image: url('/bg/bg01.jpg'); // 请确保图片存在
  background-size: cover;
  background-position: center;
  position: relative;

  .glass-mask {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.8) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
  }

  .logo {
    width: 60px;
    height: 60px;
    background: white;
    border-radius: 12px;
    padding: 8px;
  }
}

// 右侧表单区
.form-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #ffffff;

  .form-wrapper {
    width: 100%;
    max-width: 600px; // 限制表单最大宽度，防止在大屏上太宽
  }
}

// 步骤条样式微调
.custom-steps {
  :deep(.el-step__title) {
    font-size: 14px;
  }
}

// 紧凑型上传组件
.license-uploader-compact {
  width: 100%;
  :deep(.el-upload) {
    width: 100%;
    display: block;
  }

  .upload-trigger {
    border: 1px dashed #dcdfe6;
    border-radius: 8px;
    height: 80px; // 降低高度
    display: flex;
    align-items: center;
    padding: 0 20px;
    transition: all 0.3s;
    cursor: pointer;

    &:hover {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
  }

  .uploaded-view {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    height: 80px;
    display: flex;
    align-items: center;
    padding: 5px;
    position: relative;

    .thumb {
      height: 100%;
      width: 100px;
      object-fit: contain;
      background: #f5f7fa;
      border-radius: 4px;
    }

    .re-upload {
      margin-left: 20px;
      color: var(--el-color-primary);
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;

      &:hover { text-decoration: underline; }
    }
  }
}

// 响应式处理
@media (max-width: 1024px) {
  .marketing-side {
    display: none; // 平板/手机隐藏左侧
  }
}
</style>