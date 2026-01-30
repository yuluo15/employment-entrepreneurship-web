<template>
  <div class="p-5">
    <h2>图标集</h2>
    <div class="desc">
      本项目使用 Element Plus 官方图标，同时也支持自定义 svg。
    </div>
    <h2>自定义 svg 图标</h2>
    <div class="desc">
      <p>
        将 svg 图标放在
        <code>src/assets/icons/</code>
        下，即可在页面中导入使用。
      </p>
      <p>导入方式：</p>
      <p>
        <code>import wechatIcon from '@/assets/icons/wechat.svg?url'</code>
      </p>
    </div>
    <img :src="wechatIcon" width="100" height="100" alt="wechat icon" />
  </div>
</template>

<script setup lang="ts">
import wechatIcon from '@/assets/icons/wechat.svg?url'
</script>

<style scoped lang="scss">
.desc {
  @apply p-3 rounded-2xl bg-border line-height-7 w-fit my-5;
}
</style>
