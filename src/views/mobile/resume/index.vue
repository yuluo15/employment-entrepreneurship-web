<template>
  <div class="resume-dashboard bg-[#f7f8fa] min-h-screen pb-24">
    <van-nav-bar
        title="我的在线简历"
        left-arrow
        fixed
        placeholder
        @click-left="$router.back()"
    />

    <div class="bg-white p-5 mb-3 flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-gray-800 mb-1">简历完整度</h2>
        <p class="text-xs text-gray-500">完善简历可以获得更多面试机会</p>
      </div>
      <div class="relative flex items-center justify-center">
        <van-circle
            v-model:current-rate="resume.resumeScore"
            :rate="resume.resumeScore"
            :color="scoreColor"
            layer-color="#f3f4f6"
            size="60px"
            stroke-width="5"
        />
        <span class="absolute text-sm font-bold" :style="{ color: scoreColor }">
          {{ resume.resumeScore }}%
        </span>
      </div>
    </div>

    <div class="px-3 space-y-3">

      <div class="bg-white rounded-lg p-4 shadow-sm relative">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-gray-800 border-l-4 border-blue-500 pl-2">求职意向</h3>
          <van-icon name="edit" class="text-blue-500 p-2" @click="$router.push('/student/resume/edit/intent')" />
        </div>
        <div v-if="resume.expectedPosition" class="text-sm space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-500">期望职位</span>
            <span class="font-medium">{{ resume.expectedPosition }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">期望薪资</span>
            <span class="font-medium text-orange-500">{{ resume.expectedSalary }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">期望城市</span>
            <span class="font-medium">{{ resume.targetCity }}</span>
          </div>
        </div>
        <van-empty v-else description="暂未填写求职意向" image-size="60" />
      </div>

      <div class="bg-white rounded-lg p-4 shadow-sm">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-gray-800 border-l-4 border-blue-500 pl-2">教育经历</h3>
          <van-icon name="add-o" class="text-blue-500 p-2 text-lg" @click="$router.push('/student/resume/edit/education')" />
        </div>

        <div v-if="resume.educationHistory?.length" class="space-y-4">
          <div v-for="(edu, idx) in resume.educationHistory" :key="idx" class="relative pl-4 border-l border-gray-100">
            <div class="absolute -left-1.5 top-1 w-3 h-3 bg-blue-100 rounded-full border border-blue-500"></div>
            <div class="flex justify-between items-start">
              <span class="font-bold text-gray-800">{{ edu.school }}</span>
              <span class="text-xs text-gray-400">{{ edu.startDate }} - {{ edu.endDate }}</span>
            </div>
            <div class="text-xs text-gray-500 mt-1">{{ edu.degree }} · {{ edu.major }}</div>
          </div>
        </div>
        <van-empty v-else description="请添加教育经历" image-size="60" />
      </div>

      <div class="bg-white rounded-lg p-4 shadow-sm">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-gray-800 border-l-4 border-blue-500 pl-2">实习与项目</h3>
          <van-icon name="edit" class="text-blue-500 p-2" @click="$router.push('/student/resume/edit/experience')" />
        </div>
        <div class="text-sm text-gray-500">
          <div class="flex justify-between py-1">
            <span>实习经历</span>
            <span class="text-gray-800">{{ resume.internshipExp?.length || 0 }} 段</span>
          </div>
          <div class="flex justify-between py-1">
            <span>项目经历</span>
            <span class="text-gray-800">{{ resume.projectExp?.length || 0 }} 个</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg p-4 shadow-sm">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-gray-800 border-l-4 border-blue-500 pl-2">个人优势</h3>
          <van-icon name="edit" class="text-blue-500 p-2" @click="$router.push('/student/resume/edit/intent')" />
        </div>
        <div v-if="resume.personalSummary" class="text-sm text-gray-600 leading-relaxed line-clamp-3">
          {{ resume.personalSummary }}
        </div>
        <div v-else class="text-xs text-gray-400">用几句话介绍你的亮点...</div>
      </div>

    </div>

    <div class="fixed bottom-0 left-0 w-full p-3 bg-white border-t border-gray-100 z-50 safe-area-bottom">
      <van-button block round type="primary" color="#3b82f6" icon="eye-o" @click="showResumePreview = true">
        预览简历
      </van-button>
    </div>

    <van-popup
        v-model:show="showResumePreview"
        position="bottom"
        round
        :style="{ height: '90%' }"
        closeable
        class="resume-preview-popup"
    >
      <div class="h-full flex flex-col bg-[#f7f8fa]">
        <div class="text-center font-bold text-lg py-3 bg-white border-b border-gray-100 shrink-0 sticky top-0 z-50">
          简历预览
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-3">

          <div class="bg-white p-5 rounded-xl shadow-sm relative overflow-hidden">
            <div class="absolute -top-6 -right-6 w-28 h-28 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full opacity-60"></div>

            <div class="relative z-10 flex items-start justify-between mb-6">
              <div>
                <h1 class="text-2xl font-bold text-gray-800 mb-1 flex items-center">
                  {{ userInfo.name }}
                  <span v-if="resume.arrivalTime" class="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {{ resume.arrivalTime }}
              </span>
                </h1>
                <div class="text-xs text-gray-500 flex items-center gap-2 mt-1">
                  <span>2026届</span>
                  <span class="w-[1px] h-2 bg-gray-300"></span>
                  <span>{{ resume.targetCity || '意向城市未知' }}</span>
                  <span class="w-[1px] h-2 bg-gray-300"></span>
                  <span>{{ resume.jobType === 1 ? '全职' : '实习' }}</span>
                </div>
              </div>
              <van-image
                  round
                  width="56px"
                  height="56px"
                  :src="userStore.userInfo?.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
                  class="border-2 border-white shadow-sm"
                  fit="cover"
              />
            </div>

            <div class="bg-[#f0f9ff] p-3 rounded-lg flex justify-between items-center border border-blue-50">
              <div>
                <div class="text-[10px] text-gray-400 mb-0.5">期望职位</div>
                <div class="font-bold text-gray-800 text-sm">{{ resume.expectedPosition }}</div>
              </div>
              <div class="text-right">
                <div class="text-[10px] text-gray-400 mb-0.5">期望薪资</div>
                <div class="font-bold text-blue-600 text-base">{{ resume.expectedSalary }}</div>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl shadow-sm" v-if="resume.personalSummary">
            <div class="flex items-center mb-3 pb-2 border-b border-gray-50">
              <van-icon name="manager-o" color="#3b82f6" size="18" />
              <span class="ml-2 font-bold text-gray-800 text-sm">个人优势</span>
            </div>
            <div class="text-sm text-gray-600 leading-6 text-justify">
              {{ resume.personalSummary }}
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl shadow-sm" v-if="resume.skills">
            <div class="flex items-center mb-3 pb-2 border-b border-gray-50">
              <van-icon name="award-o" color="#3b82f6" size="18" />
              <span class="ml-2 font-bold text-gray-800 text-sm">技能清单</span>
            </div>
            <div class="flex flex-wrap gap-2">
          <span
              v-for="(skill, idx) in formatSkills(resume.skills)"
              :key="idx"
              class="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-100"
          >
            {{ skill }}
          </span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl shadow-sm" v-if="resume.internshipExp?.length">
            <div class="flex items-center mb-1 pb-2 border-b border-gray-50">
              <van-icon name="bag-o" color="#3b82f6" size="18" />
              <span class="ml-2 font-bold text-gray-800 text-sm">实习经历</span>
            </div>

            <van-steps direction="vertical" :active="-1" class="custom-steps -ml-4">
              <van-step v-for="(item, idx) in resume.internshipExp" :key="idx">
                <div class="flex justify-between items-start mb-1">
                  <h3 class="font-bold text-sm text-gray-800">{{ item.company }}</h3>
                  <span class="text-[10px] text-gray-400 font-mono mt-0.5">{{ formatRange(item.startDate, item.endDate) }}</span>
                </div>
                <div class="text-xs text-blue-600 font-medium mb-1.5">{{ item.role }}</div>
                <div class="text-xs text-gray-500 leading-relaxed text-justify bg-gray-50 p-2 rounded">
                  {{ item.description }}
                </div>
              </van-step>
            </van-steps>
          </div>

          <div class="bg-white p-4 rounded-xl shadow-sm" v-if="resume.projectExp?.length">
            <div class="flex items-center mb-1 pb-2 border-b border-gray-50">
              <van-icon name="label-o" color="#3b82f6" size="18" />
              <span class="ml-2 font-bold text-gray-800 text-sm">项目经历</span>
            </div>

            <van-steps direction="vertical" :active="-1" class="custom-steps -ml-4">
              <van-step v-for="(item, idx) in resume.projectExp" :key="idx">
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center">
                    <h3 class="font-bold text-sm text-gray-800 mr-2">{{ item.projectName }}</h3>
                    <van-icon v-if="item.projectLink" name="link-o" color="#3b82f6" @click="copyLink(item.projectLink)" />
                  </div>
                  <span class="text-[10px] text-gray-400 font-mono">{{ formatRange(item.startDate, item.endDate) }}</span>
                </div>
                <div class="text-xs text-blue-600 font-medium mb-1.5">{{ item.role }}</div>
                <div class="text-xs text-gray-500 leading-relaxed text-justify">
                  {{ item.description }}
                </div>
              </van-step>
            </van-steps>
          </div>

          <div class="bg-white p-4 rounded-xl shadow-sm" v-if="resume.educationHistory?.length">
            <div class="flex items-center mb-3 pb-2 border-b border-gray-50">
              <van-icon name="wap-home-o" color="#3b82f6" size="18" />
              <span class="ml-2 font-bold text-gray-800 text-sm">教育经历</span>
            </div>
            <div class="space-y-3">
              <div v-for="(edu, idx) in resume.educationHistory" :key="idx" class="flex justify-between items-start">
                <div>
                  <div class="font-bold text-sm text-gray-800">{{ edu.school }}</div>
                  <div class="text-xs text-gray-500 mt-0.5">{{ edu.major }} · {{ edu.degree }}</div>
                </div>
                <div class="text-[10px] text-gray-400 font-mono mt-0.5">
                  {{ formatRange(edu.startDate, edu.endDate) }}
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="p-3 bg-white border-t border-gray-100 flex gap-3 shrink-0 safe-area-bottom">
          <van-button block round plain type="primary" size="small" @click="showResumePreview = false">继续编辑</van-button>
          <van-button block round type="primary" color="#3b82f6" size="small" @click="handleExport">导出PDF</van-button>
        </div>
      </div>
    </van-popup>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getResumeDetail, type StudentResumeVo } from '@/api/mobile/resume'
import { showToast } from 'vant'
import { useUserStore } from '@/store/userStore'
// [新增] 引入 profile API 用于兜底
import { getProfileSummary } from '@/api/mobile/profile'

const userStore = useUserStore()
const resume = ref<Partial<StudentResumeVo>>({})
const showResumePreview = ref(false)

// [修改] 智能获取用户信息
const userInfo = computed(() => {
  // 优先用 Store 里的数据
  return {
    name: userStore.userInfo?.name || userStore.userInfo?.showName || '同学',
    avatar: userStore.userInfo?.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
  }
})

const scoreColor = computed(() => {
  const s = resume.value.resumeScore || 0
  if (s < 60) return '#ff976a'
  if (s < 80) return '#1989fa'
  return '#07c160'
})

const copyLink = (link: string) => {
  navigator.clipboard.writeText(link).then(() => {
    showToast('链接已复制')
  }).catch(() => {
    showToast('复制失败，请手动复制')
  })
}

const handleExport = () => {
  showToast('PDF导出功能开发中...')
}

onMounted(async () => {
  const res = await getResumeDetail()
  resume.value = res.data || {}
})

// [新增] 处理技能字符串 "Java,Vue" -> ["Java", "Vue"]
const formatSkills = (str?: string) => {
  if (!str) return []
  // 兼容中英文逗号
  return str.split(/[,，]/).map(s => s.trim()).filter(Boolean)
}

// [新增] 处理时间区间
const formatRange = (start?: string, end?: string) => {
  if (!start) return ''
  // 如果是 '2023-09' 这种格式，可以截取
  return `${start} ~ ${end || '至今'}`
}
</script>

<style scoped>
/* 自定义 Vant Steps 样式，使其更紧凑 */
.custom-steps :deep(.van-step--vertical) {
  padding: 0 0 0 0;
}
.custom-steps :deep(.van-step__circle) {
  width: 8px;
  height: 8px;
  background-color: #3b82f6; /* 蓝色节点 */
}
.custom-steps :deep(.van-step__line) {
  background-color: #e5e7eb; /* 浅灰线条 */
}
.custom-steps :deep(.van-step__title) {
  font-size: 14px;
  /* 调整右侧内容的间距 */
  margin-bottom: 12px;
}
</style>