<template>
  <div class="project-detail pb-24 min-h-screen bg-[#f7f8fa]">
    <div
        class="fixed top-3 left-3 z-50 bg-black/20 rounded-full p-1.5 backdrop-blur-sm"
        @click="$router.back()"
    >
      <van-icon name="arrow-left" color="white" size="20" />
    </div>

    <div v-if="loading" class="p-4 pt-20">
      <van-skeleton title avatar :row="3" />
      <van-skeleton title :row="5" class="mt-8" />
    </div>

    <div v-else>
      <div class="bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] p-6 text-white pt-16 pb-16 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full translate-x-10 -translate-y-10"></div>
        <div class="flex items-start z-10 relative mt-4">
          <van-image
              width="64px"
              height="64px"
              radius="12px"
              :src="detail.logo"
              class="mr-4 bg-white p-1 rounded-xl shadow-lg shrink-0"
          />
          <div class="flex-1 relative pr-16">
            <h1 class="text-xl font-bold mb-2 leading-snug">{{ detail.title }}</h1>
            <div class="text-xs opacity-80 mb-2 line-clamp-2">{{ detail.slogan }}</div>
            <div class="absolute top-0 right-[-10px]">
              <van-tag type="warning" mark size="medium">{{ detail.status }}</van-tag>
            </div>
          </div>
        </div>
      </div>

      <div class="px-3 -mt-10 relative z-10 space-y-3">
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <div class="text-xs text-gray-400 mb-1">所属高校</div>
              <div class="text-sm font-bold text-gray-800 truncate">{{ detail.schoolName }}</div>
            </div>
            <div class="border-l border-gray-100">
              <div class="text-xs text-gray-400 mb-1">团队规模</div>
              <div class="text-sm font-bold text-gray-800">{{ detail.teamSize }}人</div>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-500 flex justify-between items-center">
            <div class="flex items-center">
              <van-icon name="manager" class="mr-1" /> 负责人: {{ detail.leaderName }}
            </div>
            <div class="flex items-center">
              <van-icon name="medal" class="mr-1" /> 导师: {{ detail.mentorName }}
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="font-bold text-gray-800 mb-3 border-l-4 border-[#7c3aed] pl-2 text-sm">项目介绍</h3>
          <div class="text-sm text-gray-600 leading-7 text-justify">
            {{ detail.description }}
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <van-tag v-for="tag in detail.tags" :key="tag" color="#f3f0ff" text-color="#7c3aed" class="px-2 py-1"># {{ tag }}</van-tag>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-bold text-gray-800 border-l-4 border-orange-500 pl-2 text-sm">寻找合伙人</h3>
            <span class="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">急需</span>
          </div>
          <div class="bg-[#fff7ed] p-3 rounded-lg text-sm text-[#c2410c] leading-relaxed mb-3">
            {{ detail.needs }}
          </div>
          <van-button block round color="linear-gradient(to right, #ff6034, #ee0a24)" size="small" @click="contactLeader">
            <template #icon><van-icon name="chat-o" /></template>
            联系负责人
          </van-button>
        </div>
      </div>
    </div>

    <van-action-bar style="z-index: 2000; padding-bottom: env(safe-area-inset-bottom);">
<!--      <van-action-bar-icon icon="share-o" text="分享" />-->

      <van-action-bar-icon
          :icon="isCollected ? 'star' : 'star-o'"
          :text="isCollected ? '已关注' : '关注'"
          :color="isCollected ? '#ff5000' : '#333'"
          @click="handleCollect"
      />

      <van-action-bar-button
          :color="buttonConfig.color"
          type="primary"
          :text="buttonConfig.text"
          :disabled="buttonConfig.disabled"
          @click="handleJoin"
      />
    </van-action-bar>

    <!-- 申请对话框 -->
    <van-dialog
      v-model:show="showApplyDialog"
      title="申请加入项目"
      show-cancel-button
      :before-close="handleApply"
    >
      <div class="p-4">
        <van-field
          v-model="applyForm.applicationReason"
          rows="5"
          autosize
          type="textarea"
          maxlength="500"
          placeholder="请说明您的申请理由（至少20字）"
          show-word-limit
          class="mb-3"
        />
        <van-field
          v-model="applyForm.skills"
          rows="3"
          autosize
          type="textarea"
          maxlength="200"
          placeholder="请简述您的技能特长（选填）"
          show-word-limit
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
// ... (script 保持不变)
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getProjectDetail, type ProjectDetailVo, applyToJoinProject } from '@/api/mobile/project'
import { showToast, showLoadingToast, closeToast, showDialog } from 'vant'
import { toggleCollection } from '@/api/mobile/interaction' // [新增]

const route = useRoute()
const detail = ref<Partial<ProjectDetailVo>>({})
const loading = ref(true)

const isCollected = ref(false) // [新增] 收藏状态

// 申请对话框
const showApplyDialog = ref(false)
const applyForm = ref({
  applicationReason: '',
  skills: ''
})

onMounted(async () => {
  loading.value = true
  try {
    const id = route.params.id as string
    const res = await getProjectDetail(id)
    detail.value = res.data
    // [核心修改] 初始化收藏状态
    isCollected.value = !!res.data.isCollected
  } finally {
    setTimeout(() => { loading.value = false }, 300)
  }
})

// [新增] 处理收藏/关注
const handleCollect = async () => {
  if (!detail.value.projectId) return // 注意 ProjectDetailVo 里的 ID 字段名是 projectId
  try {
    const res = await toggleCollection({
      targetId: detail.value.projectId,
      type: 'PROJECT'
    })
    isCollected.value = res.data
    showToast(isCollected.value ? '关注成功' : '已取消关注')
  } catch (error) {
    console.error(error)
  }
}

const contactLeader = () => {
  if (!detail.value.leaderPhone) {
    showToast('负责人未公开联系方式')
    return
  }
  
  showDialog({
    title: '负责人联系方式',
    message: `姓名：${detail.value.leaderName}\n手机：${detail.value.leaderPhone}\n\n温馨提示：请礼貌沟通，说明来意`,
    confirmButtonText: '复制手机号',
    cancelButtonText: '关闭',
    closeOnClickOverlay: true
  }).then(() => {
    // 复制手机号到剪贴板
    if (navigator.clipboard) {
      navigator.clipboard.writeText(detail.value.leaderPhone || '')
      showToast('已复制到剪贴板')
    } else {
      // 兼容方案
      const input = document.createElement('input')
      input.value = detail.value.leaderPhone || ''
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      showToast('已复制到剪贴板')
    }
  }).catch(() => {
    // 用户点击取消，不做任何操作
  })
}

// 按钮配置
const buttonConfig = computed(() => {
  if (detail.value.isOwner) {
    return { text: '这是我的项目', disabled: true, color: '#999' }
  }
  
  switch (detail.value.applicationStatus) {
    case 'PENDING':
      return { text: '申请审核中', disabled: true, color: '#ff9800' }
    case 'APPROVED':
      return { text: '已加入项目', disabled: true, color: '#4caf50' }
    case 'REJECTED':
      return { text: '申请未通过', disabled: true, color: '#f44336' }
    default:
      return { text: '申请加入项目', disabled: false, color: '#7c3aed' }
  }
})

const handleJoin = () => {
  if (detail.value.isOwner) {
    showToast('不能申请自己的项目')
    return
  }
  
  if (detail.value.applicationStatus) {
    showToast('您已经申请过该项目')
    return
  }
  
  showApplyDialog.value = true
}

// 提交申请
const handleApply = async (action: string) => {
  if (action === 'confirm') {
    if (!applyForm.value.applicationReason || applyForm.value.applicationReason.trim().length < 20) {
      showToast('请输入至少20个字的申请理由')
      return false
    }

    const toast = showLoadingToast({
      message: '提交中...',
      forbidClick: true,
      duration: 0
    })

    try {
      await applyToJoinProject({
        projectId: detail.value.projectId!,
        applicationReason: applyForm.value.applicationReason.trim(),
        skills: applyForm.value.skills.trim() || undefined
      })

      closeToast()
      showToast('申请已提交，请等待审核')
      
      // 更新申请状态
      detail.value.applicationStatus = 'PENDING'
      
      // 清空表单
      applyForm.value = {
        applicationReason: '',
        skills: ''
      }
      
      return true
    } catch (error: any) {
      closeToast()
      const msg = error?.response?.data?.message || '申请失败，请重试'
      showToast(msg)
      return false
    }
  }
  return true
}
</script>