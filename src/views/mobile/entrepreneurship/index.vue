<template>
  <div class="entrep-page p-4">
    <van-empty description="创业资源模块建设中..." image="search" />

    <div class="mt-4">
      <h3 class="font-bold text-gray-700 mb-2">热门服务</h3>
      <van-grid :column-num="2" :gutter="10">
        <van-grid-item icon="manager" text="创业导师库" class="bg-blue-50" />
        <van-grid-item icon="balance-list" text="扶持资金申请" />
        <van-grid-item icon="cluster" text="项目孵化" />
        <van-grid-item icon="todo-list" text="场地预约" />
      </van-grid>
    </div>
  </div>
</template>

<script setup lang="ts">
// 创业模块后续开发
</script>