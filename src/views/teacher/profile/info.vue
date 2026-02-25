<template>
  <div class="teacher-profile-info bg-[#f7f8fa] min-h-screen">
    <van-nav-bar
        title="个人信息"
        left-arrow
        right-text="保存"
        @click-left="$router.back()"
        @click-right="onSave"
    />

    <div class="p-4">
      <div class="bg-white rounded-xl p-6 mb-4 flex flex-col items-center justify-center shadow-sm">
        <van-uploader :after-read="afterRead" :max-count="1">
          <div class="relative">
            <van-image
                round
                width="80px"
                height="80px"
                :src="form.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
                fit="cover"
                class="border-2 border-white shadow-md"
            />
            <div class="absolute bottom-0 right-0 bg-purple-500 rounded-full p-1.5 border-2 border-white">
              <van-icon name="photograph" color="white" size="14" />
            </div>
          </div>
        </van-uploader>
        <span class="text-xs text-gray-400 mt-2">点击修改头像</span>
      </div>

      <div class="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
        <div class="px-4 py-3 bg-gray-50 text-xs text-gray-500 font-bold border-b border-gray-100">
          身份信息 (不可修改)
        </div>
        <van-field v-model="form.name" label="姓名" readonly input-align="right" />
        <van-field v-model="form.employeeNo" label="工号" readonly input-align="right" />
        <van-field v-model="form.schoolName" label="所属学校" readonly input-align="right" />
        <van-field v-model="form.collegeName" label="所属学院" readonly input-align="right" />
        <van-field v-model="form.title" label="职称" readonly input-align="right" />
      </div>

      <div class="bg-white rounded-xl overflow-hidden shadow-sm">
        <div class="px-4 py-3 bg-gray-50 text-xs text-gray-500 font-bold border-b border-gray-100">
          基本资料
        </div>

        <van-field name="gender" label="性别" input-align="right">
          <template #input>
            <van-radio-group v-model="form.gender" direction="horizontal">
              <van-radio name="1">男</van-radio>
              <van-radio name="2">女</van-radio>
            </van-radio-group>
          </template>
        </van-field>

        <van-field
            v-model="form.phone"
            label="手机号码"
            placeholder="请输入手机号"
            input-align="right"
            required
            :rules="[{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误' }]"
        />

        <van-field
            v-model="form.email"
            label="电子邮箱"
            placeholder="请输入邮箱"
            input-align="right"
            :rules="[{ type: 'email', message: '邮箱格式错误' }]"
        />

        <van-field
            v-model="form.expertise"
            label="专业领域"
            placeholder="请输入专业领域"
            input-align="right"
        />

        <van-field
            v-model="form.intro"
            label="个人简介"
            type="textarea"
            placeholder="请输入个人简介"
            rows="3"
            maxlength="200"
            show-word-limit
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTeacherInfo, updateTeacherInfo } from '@/api/teacher'
import { uploadFile } from '@/api/common'
import { showSuccessToast, showLoadingToast, showFailToast } from 'vant'
import { useUserStore } from '@/store/userStore'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  avatar: '',
  name: '',
  employeeNo: '',
  schoolName: '',
  collegeName: '',
  title: '',
  gender: '1',
  phone: '',
  email: '',
  expertise: '',
  intro: ''
})

onMounted(async () => {
  try {
    const res = await getTeacherInfo()
    form.value = {
      ...res.data,
      gender: res.data.gender || '1'
    }
  } catch (e) {
    console.error(e)
    showFailToast('加载信息失败')
  }
})

// 头像上传
const afterRead = async (fileObj: any) => {
  fileObj.status = 'uploading'
  fileObj.message = '上传中'

  try {
    const res = await uploadFile(fileObj.file)
    form.value.avatar = res.data
    fileObj.status = 'done'
  } catch (error) {
    fileObj.status = 'failed'
    showFailToast('上传失败')
  }
}

// 保存提交
const onSave = async () => {
  if (!form.value.phone) return showFailToast('手机号不能为空')

  showLoadingToast('保存中...')
  try {
    await updateTeacherInfo({
      avatar: form.value.avatar || '',
      gender: form.value.gender || '1',
      phone: form.value.phone,
      email: form.value.email || '',
      expertise: form.value.expertise || '',
      intro: form.value.intro || ''
    })

    // 更新 Store 中的头像和名字
    userStore.setUserInfo({
      avatar: form.value.avatar,
      name: form.value.name
    })

    showSuccessToast('保存成功')
    setTimeout(() => router.back(), 500)
  } catch (e) {
    // error handled
  }
}
</script>

<style scoped>
:deep(.van-field__label) {
  color: #64748b;
}
</style>
