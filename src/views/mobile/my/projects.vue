<template>
  <div class="my-projects bg-[#f7f8fa] min-h-screen pb-24">
    <van-nav-bar
        title="我发布的项目"
        left-arrow
        fixed
        placeholder
        @click-left="$router.back()"
    />

    <div class="p-3">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多项目了"
            @load="onLoad"
        >
          <div
              v-for="item in list"
              :key="item.id"
              class="bg-white rounded-lg shadow-sm mb-3 overflow-hidden"
          >
            <div class="p-3 flex items-start gap-3" @click="toDetail(item.id)">
              <van-image
                  :src="item.logo"
                  width="72px"
                  height="72px"
                  radius="6px"
                  class="bg-gray-50 border border-gray-100 shrink-0"
                  fit="cover"
              />
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start">
                  <h3 class="font-bold text-gray-800 text-base truncate mb-1">{{ item.name }}</h3>
                  <van-tag :type="getStatusType(item.status)" size="medium">{{ item.statusText || '状态未知' }}</van-tag>
                </div>
                <div class="text-xs text-gray-500 mb-2">
                  <span class="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded mr-2">{{ item.domain }}</span>
                  <span>{{ item.teamSize }}人团队</span>
                </div>
                <div v-if="item.status === 2 && item.auditReason" class="text-xs text-red-500 bg-red-50 p-2 rounded mt-1">
                  驳回原因：{{ item.auditReason }}
                </div>
              </div>
            </div>

            <div class="border-t border-gray-100 flex">
              <button
                  class="flex-1 py-3 text-sm text-gray-600 active:bg-gray-50 flex justify-center items-center gap-1"
                  @click="handleEdit(item.id)"
              >
                <van-icon name="edit" /> 编辑
              </button>
              <div class="w-[1px] bg-gray-100 my-2"></div>
              <button
                  class="flex-1 py-3 text-sm active:bg-gray-50 flex justify-center items-center gap-1 relative"
                  :class="item.pendingApplicationCount > 0 ? 'text-blue-600' : 'text-gray-600'"
                  @click="viewApplications(item.id)"
              >
                <van-icon name="friends-o" /> 申请
                <van-badge 
                  v-if="item.pendingApplicationCount > 0" 
                  :content="item.pendingApplicationCount" 
                  class="ml-1"
                />
              </button>
              <div class="w-[1px] bg-gray-100 my-2"></div>
              <button
                  class="flex-1 py-3 text-sm text-red-500 active:bg-gray-50 flex justify-center items-center gap-1"
                  @click="handleDelete(item.id)"
              >
                <van-icon name="delete-o" /> 删除
              </button>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>

      <van-empty v-if="!loading && list.length === 0" description="暂无项目，快去发布吧" />
    </div>

    <div class="fixed bottom-10 right-4 z-50">
      <van-button
          round
          icon="plus"
          type="primary"
          class="shadow-lg !h-12 !px-6 font-bold"
          color="linear-gradient(to right, #7c3aed, #6d28d9)"
          to="/student/my/project/edit"
      >
        发布项目
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showSuccessToast } from 'vant'
import { getMyProjectList, deleteProject, type MyProjectVo } from '@/api/mobile/project'

const router = useRouter()
const list = ref<MyProjectVo[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const pageNum = ref(1)

// 状态映射：根据后端返回的 status 数字决定颜色
const getStatusType = (status: number) => {
  // 假设后端: 0审核中, 1孵化中, 2驳回, 3完结
  const map: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: 'danger',
    3: 'primary'
  }
  return map[status] || 'default'
}

const onLoad = async () => {
  if (refreshing.value) {
    list.value = []
    refreshing.value = false
  }

  try {
    const res = await getMyProjectList({
      pageNum: pageNum.value,
      pageSize: 10
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

const toDetail = (id: string) => {
  router.push(`/student/project/${id}`)
}

const handleEdit = (id: string) => {
  router.push(`/student/my/project/edit/${id}`)
}

const handleDelete = (id: string) => {
  showConfirmDialog({
    title: '删除确认',
    message: '确定要删除这个项目吗？',
    confirmButtonColor: '#ee0a24'
  })
      .then(async () => {
        await deleteProject(id)
        showSuccessToast('删除成功')
        onRefresh() // 刷新列表
      })
      .catch(() => {})
}

const viewApplications = (projectId: string) => {
  router.push(`/student/my/project/${projectId}/applications`)
}
</script>