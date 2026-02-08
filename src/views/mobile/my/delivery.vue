<template>
  <div class="delivery-list bg-[#f7f8fa] min-h-screen">
    <van-nav-bar
        :title="pageTitle"
        left-arrow
        fixed
        placeholder
        @click-left="$router.back()"
        class="bg-white"
    />

    <van-tabs v-model:active="activeStatus" sticky offset-top="46px" color="#3b82f6" @change="onTabChange">
      <van-tab title="全部" name="" />
      <van-tab title="已投递" name="DELIVERED" />
      <van-tab title="被查看" name="VIEWED" />
      <van-tab title="面试" name="INTERVIEW" />
      <van-tab title="OFFER" name="OFFER" />
      <van-tab title="不合适" name="REJECT" />
    </van-tabs>

    <div class="p-3">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多记录了"
            @load="onLoad"
        >
          <div
              v-for="item in list"
              :key="item.id"
              class="bg-white p-4 rounded-lg shadow-sm mb-3 active:bg-gray-50 transition-colors"
              @click="toJobDetail(item.jobId)"
          >
            <div class="flex justify-between items-center mb-3">
              <span class="font-bold text-gray-800 text-base truncate flex-1 mr-2">{{ item.jobName }}</span>
              <van-tag :type="getStatusType(item.status)" size="medium">{{ item.statusText }}</van-tag>
            </div>

            <div class="flex items-center mb-3">
              <span class="text-blue-600 font-bold mr-3">{{ item.salary }}</span>
              <div class="flex items-center text-gray-500 text-sm truncate flex-1">
                <van-image
                    :src="item.companyLogo"
                    width="20px"
                    height="20px"
                    radius="4px"
                    class="mr-2 bg-gray-50 border border-gray-100"
                />
                <span class="truncate">{{ item.companyName }}</span>
              </div>
            </div>

            <div class="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
              <span>投递时间：{{ item.createTime }}</span>
              <van-icon name="arrow" />
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMyDeliveryList, type StudentDeliveryVo } from '@/api/mobile/interaction'

const route = useRoute()
const router = useRouter()

const activeStatus = ref('')
const list = ref<StudentDeliveryVo[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const pageNum = ref(1)

const pageTitle = computed(() => (route.meta.title as string) || '我的投递')

// 状态颜色映射
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    'DELIVERED': 'primary',
    'VIEWED': 'success',
    'INTERVIEW': 'warning',
    'OFFER': 'danger', // 红色高亮
    'REJECT': 'default'
  }
  return map[status] || 'primary'
}

// 初始化 Tab 选中态
const initTab = () => {
  if (route.path.includes('interview')) activeStatus.value = 'INTERVIEW'
  else if (route.path.includes('offer')) activeStatus.value = 'OFFER'
  else activeStatus.value = ''
}

const onLoad = async () => {
  if (refreshing.value) {
    list.value = []
    refreshing.value = false
  }

  try {
    const res = await getMyDeliveryList({
      pageNum: pageNum.value,
      pageSize: 10,
      status: activeStatus.value || undefined
    })

    const data = res.data?.data || []
    list.value.push(...data)
    pageNum.value++

    if (data.length < 10) finished.value = true
  } catch (e) {
    finished.value = true
  } finally {
    loading.value = false
  }
}

const onRefresh = () => {
  finished.value = false
  pageNum.value = 1
  loading.value = true
  onLoad()
}

const onTabChange = () => {
  list.value = []
  pageNum.value = 1
  finished.value = false
  loading.value = true
  onLoad()
}

const toJobDetail = (jobId: string) => {
  router.push(`/student/job/${jobId}`)
}

onMounted(() => {
  initTab()
})
</script>