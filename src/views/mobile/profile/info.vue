<template>
  <div class="profile-info bg-[#f7f8fa] min-h-screen">
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
            <div class="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1.5 border-2 border-white">
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
        <van-field v-model="form.realName" label="真实姓名" readonly input-align="right" />
        <van-field v-model="form.username" label="学号/工号" readonly input-align="right" />
        <van-field v-model="form.schoolName" label="所属学校" readonly input-align="right" />
        <van-field v-model="form.major" label="主修专业" readonly input-align="right" />
        <van-field v-model="form.education" label="当前学历" readonly input-align="right" />
      </div>

      <div class="bg-white rounded-xl overflow-hidden shadow-sm">
        <div class="px-4 py-3 bg-gray-50 text-xs text-gray-500 font-bold border-b border-gray-100">
          基本资料
        </div>

        <van-field name="gender" label="性别" input-align="right">
          <template #input>
            <van-radio-group v-model="form.gender" direction="horizontal">
              <van-radio :name="1">男</van-radio>
              <van-radio :name="2">女</van-radio>
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
            v-model="form.graduationYear"
            label="毕业年份"
            readonly
            is-link
            input-align="right"
            @click="showYearPicker = true"
        />
      </div>
    </div>

    <van-popup v-model:show="showYearPicker" position="bottom" round>
      <van-picker
          :columns="yearOptions"
          @confirm="onYearConfirm"
          @cancel="showYearPicker = false"
      />
    </van-popup>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProfileDetail, updateProfile, type MyProfileVo } from '@/api/mobile/profile'
import { uploadFile } from '@/api/common'
import { showSuccessToast, showLoadingToast, showFailToast } from 'vant'
import { useUserStore } from '@/store/userStore'

const router = useRouter()
const userStore = useUserStore()

const form = ref<Partial<MyProfileVo>>({
  gender: 0
})

const showYearPicker = ref(false)
const yearOptions = Array.from({ length: 10 }, (_, i) => ({
  text: `${2022 + i}年`,
  value: `${2022 + i}`
}))

onMounted(async () => {
  try {
    const res = await getProfileDetail()
    form.value = res.data || {}
  } catch (e) {
    console.error(e)
  }
})

// 头像上传
const afterRead = async (fileObj: any) => {
  fileObj.status = 'uploading'
  fileObj.message = '上传中'

  try {
    const res = await uploadFile(fileObj.file)
    form.value.avatar = res.data // 更新视图
    fileObj.status = 'done'
  } catch (error) {
    fileObj.status = 'failed'
    showFailToast('上传失败')
  }
}

// 年份确认
const onYearConfirm = ({ selectedOptions }) => {
  form.value.graduationYear = selectedOptions[0]?.value
  showYearPicker.value = false
}

// 保存提交
const onSave = async () => {
  if (!form.value.phone) return showFailToast('手机号不能为空')

  showLoadingToast('保存中...')
  try {
    await updateProfile({
      avatar: form.value.avatar || '',
      gender: form.value.gender || 0,
      phone: form.value.phone,
      email: form.value.email || '',
      graduationYear: form.value.graduationYear || ''
    })

    // [关键] 更新 Store 中的头像和名字，保证返回上一页时数据是最新的
    userStore.setUserInfo({
      avatar: form.value.avatar,
      name: form.value.realName
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