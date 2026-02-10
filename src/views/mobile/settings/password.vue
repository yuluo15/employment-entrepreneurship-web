<template>
  <div class="change-password bg-[#f7f8fa] min-h-screen">
    <van-nav-bar
        title="修改密码"
        left-text="取消"
        right-text="提交"
        left-arrow
        @click-left="$router.back()"
        @click-right="onSubmit"
    />

    <div class="mt-4">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
              v-model="form.oldPassword"
              type="password"
              name="oldPassword"
              label="旧密码"
              placeholder="请输入当前密码"
              :rules="[{ required: true, message: '请填写旧密码' }]"
          />
          <van-field
              v-model="form.newPassword"
              type="password"
              name="newPassword"
              label="新密码"
              placeholder="请输入新密码 (6-20位)"
              :rules="[
              { required: true, message: '请填写新密码' },
              { pattern: /^.{6,20}$/, message: '密码长度需在6-20位之间' }
            ]"
          />
          <van-field
              v-model="confirmPassword"
              type="password"
              name="confirmPassword"
              label="确认密码"
              placeholder="请再次输入新密码"
              :rules="[
              { required: true, message: '请确认新密码' },
              { validator: checkPassword, message: '两次输入的密码不一致' }
            ]"
          />
        </van-cell-group>

        <div class="p-4 text-xs text-gray-400">
          <van-icon name="info-o" class="mr-1" />
          密码修改成功后，需要重新登录
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { changePassword } from '@/api/auth'
import { useUserStore } from '@/store/userStore'
import { showSuccessToast, showLoadingToast, showFailToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  oldPassword: '',
  newPassword: ''
})
const confirmPassword = ref('')

// 校验两次密码是否一致
const checkPassword = (val: string) => {
  return val === form.value.newPassword
}

const onSubmit = async () => {
  // 手动触发简单校验
  if (!form.value.oldPassword || !form.value.newPassword) return
  if (form.value.newPassword !== confirmPassword.value) {
    return showFailToast('两次输入的密码不一致')
  }

  showLoadingToast({ message: '提交中...', forbidClick: true })

  try {
    // 调用后端接口
    // 注意：需要从 userStore 获取当前用户的 userId
    await changePassword({
      userId: userStore.userId,
      oldPassword: form.value.oldPassword,
      newPassword: form.value.newPassword
    })

    showSuccessToast('修改成功，请重新登录')

    // 修改成功后，强制登出并跳转登录页
    userStore.logout() // 清理本地 token
    setTimeout(() => {
      router.replace('/login')
    }, 1000)

  } catch (error) {
    // 错误处理交由拦截器或显示错误信息
    // console.error(error)
  }
}
</script>