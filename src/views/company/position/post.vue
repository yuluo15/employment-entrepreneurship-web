<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <el-icon class="mr-2 text-blue-500"><DocumentAdd /></el-icon>
            <span class="font-bold">{{ isEdit ? '编辑职位' : '发布新职位' }}</span>
          </div>
          <el-button text @click="goBack">返回列表</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        style="max-width: 800px"
      >
        <el-form-item label="职位名称" prop="jobName">
          <el-input
            v-model="formData.jobName"
            placeholder="请输入职位名称，如：Java开发工程师"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="薪资范围" prop="salaryRange">
          <el-select v-model="formData.salaryRange" placeholder="请选择薪资范围" style="width: 100%">
            <el-option label="3K-5K" value="3-5K" />
            <el-option label="5K-8K" value="5-8K" />
            <el-option label="8K-12K" value="8-12K" />
            <el-option label="12K-20K" value="12-20K" />
            <el-option label="20K-30K" value="20-30K" />
            <el-option label="30K以上" value="30K+" />
            <el-option label="面议" value="negotiable" />
          </el-select>
        </el-form-item>

        <el-form-item label="工作城市" prop="city">
          <el-input v-model="formData.city" placeholder="请输入工作城市，如：成都" />
        </el-form-item>

        <el-form-item label="学历要求" prop="education">
          <el-select v-model="formData.education" placeholder="请选择学历要求" style="width: 100%">
            <el-option label="不限" value="unlimited" />
            <el-option label="大专" value="college" />
            <el-option label="本科" value="bachelor" />
            <el-option label="硕士" value="master" />
            <el-option label="博士" value="doctor" />
          </el-select>
        </el-form-item>

        <el-form-item label="工作经验" prop="experience">
          <el-select v-model="formData.experience" placeholder="请选择工作经验要求" style="width: 100%">
            <el-option label="不限" value="unlimited" />
            <el-option label="应届生" value="fresh" />
            <el-option label="1年以下" value="0-1" />
            <el-option label="1-3年" value="1-3" />
            <el-option label="3-5年" value="3-5" />
            <el-option label="5-10年" value="5-10" />
            <el-option label="10年以上" value="10+" />
          </el-select>
        </el-form-item>

        <el-form-item label="职位标签">
          <el-input
            v-model="formData.tags"
            placeholder="请输入职位标签，多个用逗号分隔，如：五险一金,双休,年终奖"
            maxlength="200"
          />
          <div class="text-xs text-gray-400 mt-1">提示：标签可以包括福利待遇、工作特点等</div>
        </el-form-item>

        <el-form-item label="职位描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="6"
            placeholder="请详细描述职位职责和工作内容"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="任职要求" prop="requirement">
          <el-input
            v-model="formData.requirement"
            type="textarea"
            :rows="6"
            placeholder="请详细描述任职要求和技能要求"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="联系电话" prop="contactPhone">
          <el-input
            v-model="formData.contactPhone"
            placeholder="请输入联系电话"
            maxlength="20"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '保存修改' : '立即发布' }}
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, FormInstance } from 'element-plus'
import { DocumentAdd } from '@element-plus/icons-vue'
import { addJob, updateJob, getJobDetail, type JobForm } from '@/api/company'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 是否为编辑模式
const isEdit = ref(false)
const jobId = ref('')

// 表单数据
const formData = reactive<JobForm>({
  jobName: '',
  salaryRange: '',
  city: '',
  education: '',
  experience: '',
  tags: '',
  description: '',
  requirement: '',
  contactPhone: ''
})

// 原始数据备份
let originalData: JobForm | null = null

// 表单验证规则
const formRules = {
  jobName: [
    { required: true, message: '请输入职位名称', trigger: 'blur' },
    { min: 2, max: 100, message: '职位名称长度在2-100个字符', trigger: 'blur' }
  ],
  salaryRange: [
    { required: true, message: '请选择薪资范围', trigger: 'change' }
  ],
  city: [
    { required: true, message: '请输入工作城市', trigger: 'blur' }
  ],
  education: [
    { required: true, message: '请选择学历要求', trigger: 'change' }
  ],
  experience: [
    { required: true, message: '请选择工作经验要求', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入职位描述', trigger: 'blur' },
    { min: 10, message: '职位描述至少10个字符', trigger: 'blur' }
  ],
  requirement: [
    { required: true, message: '请输入任职要求', trigger: 'blur' },
    { min: 10, message: '任职要求至少10个字符', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 加载职位详情（编辑模式）
const loadJobDetail = async () => {
  try {
    const res = await getJobDetail(jobId.value)
    const data = res.data
    Object.assign(formData, {
      jobName: data.jobName,
      salaryRange: data.salaryRange,
      city: data.city,
      education: data.education,
      experience: data.experience,
      tags: data.tags || '',
      description: data.description,
      requirement: data.requirement,
      contactPhone: data.contactPhone
    })
    originalData = { ...formData }
  } catch (error) {
    console.error('加载职位详情失败', error)
    ElMessage.error('加载职位详情失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      if (isEdit.value) {
        await updateJob({ jobId: jobId.value, ...formData })
        ElMessage.success('职位修改成功')
      } else {
        await addJob(formData)
        ElMessage.success('职位发布成功，等待管理员审核')
      }
      router.push('/company/position/manage')
    } catch (error) {
      console.error('操作失败', error)
      ElMessage.error(isEdit.value ? '修改失败' : '发布失败')
    } finally {
      submitting.value = false
    }
  })
}

// 重置表单
const handleReset = () => {
  if (isEdit.value && originalData) {
    Object.assign(formData, originalData)
  } else {
    formRef.value?.resetFields()
  }
}

// 返回列表
const goBack = () => {
  router.push('/company/position/manage')
}

onMounted(() => {
  // 检查是否为编辑模式
  if (route.query.jobId) {
    isEdit.value = true
    jobId.value = route.query.jobId as string
    loadJobDetail()
  }
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}
</style>
