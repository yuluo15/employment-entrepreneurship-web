<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <el-icon class="mr-2 text-blue-500"><OfficeBuilding /></el-icon>
            <span class="font-bold">企业信息</span>
          </div>
          <el-button v-if="!isEditing" type="primary" @click="handleEdit">编辑信息</el-button>
          <div v-else>
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="handleSave" :loading="submitting">保存</el-button>
          </div>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        :disabled="!isEditing"
        style="max-width: 900px"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          
          <el-form-item label="企业LOGO">
            <el-upload
              class="avatar-uploader"
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="handleLogoSuccess"
              :before-upload="beforeLogoUpload"
              :disabled="!isEditing"
            >
              <img v-if="formData.logo" :src="formData.logo" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="text-xs text-gray-400 mt-2">建议尺寸：200x200像素，支持JPG、PNG格式</div>
          </el-form-item>

          <el-form-item label="企业名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入企业名称" maxlength="100" show-word-limit />
          </el-form-item>

          <el-form-item label="统一社会信用代码" prop="code">
            <el-input v-model="formData.code" placeholder="请输入统一社会信用代码" maxlength="18" />
          </el-form-item>

          <el-form-item label="所属行业" prop="industry">
            <el-select v-model="formData.industry" placeholder="请选择所属行业" style="width: 100%">
              <el-option label="互联网/电子商务" value="互联网/电子商务" />
              <el-option label="计算机软件" value="计算机软件" />
              <el-option label="IT服务" value="IT服务" />
              <el-option label="电子/半导体" value="电子/半导体" />
              <el-option label="通信/网络设备" value="通信/网络设备" />
              <el-option label="金融/银行" value="金融/银行" />
              <el-option label="房地产/建筑" value="房地产/建筑" />
              <el-option label="制造业" value="制造业" />
              <el-option label="教育/培训" value="教育/培训" />
              <el-option label="医疗/健康" value="医疗/健康" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>

          <el-form-item label="企业规模" prop="scale">
            <el-select v-model="formData.scale" placeholder="请选择企业规模" style="width: 100%">
              <el-option label="0-20人" value="0-20" />
              <el-option label="20-99人" value="20-99" />
              <el-option label="100-499人" value="100-499" />
              <el-option label="500-999人" value="500-999" />
              <el-option label="1000-9999人" value="1000-9999" />
              <el-option label="10000人以上" value="10000+" />
            </el-select>
          </el-form-item>

          <el-form-item label="成立时间" prop="foundedDate">
            <el-date-picker
              v-model="formData.foundedDate"
              type="date"
              placeholder="选择成立时间"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="注册资本">
            <el-input v-model="formData.registeredCapital" placeholder="请输入注册资本，如：1000万元" />
          </el-form-item>

          <el-form-item label="企业网站">
            <el-input v-model="formData.website" placeholder="请输入企业网站，如：https://www.example.com" />
          </el-form-item>
        </div>

        <!-- 联系信息 -->
        <div class="form-section">
          <h3 class="section-title">联系信息</h3>

          <el-form-item label="企业地址" prop="address">
            <el-input v-model="formData.address" placeholder="请输入企业详细地址" />
          </el-form-item>

          <el-form-item label="联系人" prop="contactPerson">
            <el-input v-model="formData.contactPerson" placeholder="请输入联系人姓名" />
          </el-form-item>

          <el-form-item label="联系电话" prop="contactPhone">
            <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
          </el-form-item>

          <el-form-item label="联系邮箱" prop="email">
            <el-input v-model="formData.email" placeholder="请输入联系邮箱" />
          </el-form-item>
        </div>

        <!-- 企业介绍 -->
        <div class="form-section">
          <h3 class="section-title">企业介绍</h3>

          <el-form-item label="企业简介" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="6"
              placeholder="请输入企业简介，介绍企业的主营业务、发展历程、企业文化等"
              maxlength="2000"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="福利待遇">
            <el-input
              v-model="formData.benefits"
              type="textarea"
              :rows="4"
              placeholder="请输入福利待遇，如：五险一金、带薪年假、节日福利、员工体检等"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>
        </div>

        <!-- 认证信息（只读） -->
        <div class="form-section">
          <h3 class="section-title">认证信息</h3>

          <el-form-item label="认证状态">
            <el-tag :type="getStatusTagType(companyInfo.status)" size="large">
              {{ getStatusLabel(companyInfo.status) }}
            </el-tag>
          </el-form-item>

          <el-form-item label="创建时间">
            <span class="text-gray-600">{{ companyInfo.createTime }}</span>
          </el-form-item>

          <el-form-item label="更新时间">
            <span class="text-gray-600">{{ companyInfo.updateTime }}</span>
          </el-form-item>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { OfficeBuilding, Plus } from '@element-plus/icons-vue'
import { getCompanyInfo, updateCompanyInfo, type CompanyInfo } from '@/api/company'

// 上传地址（需要根据实际情况配置）
const uploadUrl = ref(import.meta.env.VITE_API_BASE_URL + '/common/upload')

// 是否编辑模式
const isEditing = ref(false)
const submitting = ref(false)

// 表单引用
const formRef = ref<FormInstance>()

// 企业信息（原始数据）
const companyInfo = ref<CompanyInfo>({
  id: '',
  name: '',
  code: '',
  industry: '',
  scale: '',
  foundedDate: '',
  registeredCapital: '',
  website: '',
  logo: '',
  address: '',
  contactPerson: '',
  contactPhone: '',
  email: '',
  description: '',
  benefits: '',
  status: 0,
  createTime: '',
  updateTime: ''
})

// 表单数据
const formData = reactive<CompanyInfo>({
  id: '',
  name: '',
  code: '',
  industry: '',
  scale: '',
  foundedDate: '',
  registeredCapital: '',
  website: '',
  logo: '',
  address: '',
  contactPerson: '',
  contactPhone: '',
  email: '',
  description: '',
  benefits: '',
  status: 0,
  createTime: '',
  updateTime: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入企业名称', trigger: 'blur' },
    { min: 2, max: 100, message: '企业名称长度在2-100个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入统一社会信用代码', trigger: 'blur' },
    { pattern: /^[0-9A-Z]{18}$/, message: '请输入正确的统一社会信用代码（18位）', trigger: 'blur' }
  ],
  industry: [
    { required: true, message: '请选择所属行业', trigger: 'change' }
  ],
  scale: [
    { required: true, message: '请选择企业规模', trigger: 'change' }
  ],
  address: [
    { required: true, message: '请输入企业地址', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入联系邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入企业简介', trigger: 'blur' },
    { min: 20, message: '企业简介至少20个字符', trigger: 'blur' }
  ]
}

// 加载企业信息
const loadCompanyInfo = async () => {
  try {
    const res = await getCompanyInfo()
    companyInfo.value = res.data
    Object.assign(formData, res.data)
  } catch (error) {
    console.error('加载企业信息失败', error)
    ElMessage.error('加载企业信息失败')
  }
}

// 编辑
const handleEdit = () => {
  isEditing.value = true
}

// 取消
const handleCancel = () => {
  isEditing.value = false
  Object.assign(formData, companyInfo.value)
  formRef.value?.clearValidate()
}

// 保存
const handleSave = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      await updateCompanyInfo(formData)
      ElMessage.success('保存成功')
      isEditing.value = false
      loadCompanyInfo()
    } catch (error) {
      console.error('保存失败', error)
      ElMessage.error('保存失败')
    } finally {
      submitting.value = false
    }
  })
}

// LOGO上传成功
const handleLogoSuccess = (response: any) => {
  if (response.code === 200) {
    formData.logo = response.data.url
    ElMessage.success('LOGO上传成功')
  } else {
    ElMessage.error('LOGO上传失败')
  }
}

// LOGO上传前校验
const beforeLogoUpload = (file: File) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 工具函数
const getStatusLabel = (status: number) => {
  const map: Record<number, string> = {
    0: '待审核',
    1: '已认证',
    2: '审核未通过'
  }
  return map[status] || '未知'
}

const getStatusTagType = (status: number) => {
  const map: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return map[status] || ''
}

onMounted(() => {
  loadCompanyInfo()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.form-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #ebeef5;

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;
    padding-left: 10px;
    border-left: 4px solid #409eff;
  }
}

.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
    }
  }

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
    object-fit: cover;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
}
</style>
