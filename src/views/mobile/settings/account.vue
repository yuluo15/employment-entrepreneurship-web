<template>
  <div class="account-settings bg-[#f7f8fa] min-h-screen">
    <van-nav-bar
        title="账号与安全"
        left-arrow
        @click-left="$router.back()"
    />

    <div class="mt-4">
      <van-cell-group inset>
        <van-cell
            title="修改密码"
            is-link
            to="/student/settings/password"
            size="large"
        />
      </van-cell-group>
    </div>

    <div class="px-4 mt-8">
      <van-button
          block
          round
          color="#ee0a24"
          size="large"
          class="shadow-sm"
          @click="handleLogout"
      >
        退出登录
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { showConfirmDialog, showSuccessToast } from 'vant'
import { useUserStore } from '@/store/userStore'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  // 使用 Vant 的确认弹窗，比原生 alert 美观得多
  showConfirmDialog({
    title: '温馨提示',
    message: '确定要退出当前账号吗？',
    confirmButtonColor: '#ee0a24', // 确认按钮用红色，警示作用
    cancelButtonColor: '#666',
    theme: 'round-button', // 圆角按钮风格，更现代
  })
      .then(async () => {
        // 1. 调用 Store 的 logout (内部会调后端接口并清缓存)
        await userStore.logout()

        showSuccessToast('已退出登录')

        // 2. 跳转回登录页
        setTimeout(() => {
          router.replace('/login')
        }, 500)
      })
      .catch(() => {
        // 点击取消，什么都不做
      })
}
</script>