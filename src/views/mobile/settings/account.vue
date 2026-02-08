<template>
  <div class="account-settings bg-[#f7f8fa] min-h-screen">
    <van-nav-bar
        title="账号与安全"
        left-arrow
        fixed
        placeholder
        @click-left="$router.back()"
    />

    <div class="mt-3">
      <van-cell-group inset>
        <van-cell title="修改密码" is-link />
        <van-cell title="更换手机号" is-link value="138****8888" />
        <van-cell title="微信绑定" is-link value="已绑定" />
      </van-cell-group>
    </div>

    <div class="mt-3">
      <van-cell-group inset>
        <van-cell title="注销账号" is-link label="注销后无法恢复，请谨慎操作" />
      </van-cell-group>
    </div>

    <div class="px-4 mt-8">
      <van-button
          block
          color="#fff"
          class="!text-red-500 !border-none shadow-sm"
          @click="handleLogout"
      >
        退出登录
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import { useUserStore } from '@/store/userStore'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定要退出当前账号吗？',
    confirmButtonColor: '#ee0a24'
  })
      .then(() => {
        userStore.logout()
        router.replace('/login')
      })
      .catch(() => {
        // on cancel
      })
}
</script>

<style scoped>
/* Vant 样式微调 */
</style>