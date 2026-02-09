<template>
  <div class="edit-intent bg-white min-h-screen">
    <van-nav-bar
        title="编辑求职意向"
        left-text="取消"
        right-text="保存"
        left-arrow
        @click-left="$router.back()"
        @click-right="onSave"
    />

    <van-form class="mt-4">
      <van-cell-group inset>
        <van-field
            v-model="form.expectedPosition"
            label="期望职位"
            placeholder="例如：Java开发工程师"
            required
        />

        <van-field name="jobType" label="求职类型" required>
          <template #input>
            <van-radio-group v-model="form.jobType" direction="horizontal">
              <van-radio :name="1">全职</van-radio>
              <van-radio :name="2">实习</van-radio>
            </van-radio-group>
          </template>
        </van-field>

        <van-field
            v-model="form.expectedSalary"
            label="期望薪资"
            placeholder="例如：8k-12k"
            required
        />
        <van-field
            v-model="form.targetCity"
            label="期望城市"
            placeholder="例如：成都"
            required
        />

        <van-field
            v-model="form.arrivalTime"
            label="到岗时间"
            placeholder="例如：随时 / 2周内"
        />

        <van-field
            v-model="form.skills"
            label="技能关键词"
            type="textarea"
            rows="2"
            autosize
            placeholder="例如：Java, Spring Boot, Vue3 (用逗号分隔)"
        />
        <van-field
            v-model="form.personalSummary"
            label="个人优势"
            type="textarea"
            rows="4"
            autosize
            placeholder="简单介绍你的核心竞争力..."
            show-word-limit
            maxlength="200"
        />
      </van-cell-group>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getResumeDetail, saveResume, type StudentResumeVo } from '@/api/mobile/resume'
import { showSuccessToast, showLoadingToast } from 'vant'

const router = useRouter()
const form = ref<Partial<StudentResumeVo>>({})

// 初始化：先拉取现有数据
onMounted(async () => {
  const res = await getResumeDetail()
  form.value = res.data || {}

  // 如果是新简历没有 jobType，可以默认选全职(1)，或者不处理让用户选
  if (form.value.jobType === undefined || form.value.jobType === null) {
    form.value.jobType = 1
  }
})

const onSave = async () => {
  showLoadingToast({ message: '保存中...', forbidClick: true })
  try {
    // 提交保存
    await saveResume(form.value)
    showSuccessToast('保存成功')
    setTimeout(() => router.back(), 500)
  } catch (error) {
    // error handled by interceptor
  }
}
</script>