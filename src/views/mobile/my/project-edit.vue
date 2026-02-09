<template>
  <div class="project-edit bg-white min-h-screen">
    <van-nav-bar
        :title="isEdit ? '编辑项目' : '发布新项目'"
        left-text="取消"
        right-text="保存"
        left-arrow
        @click-left="$router.back()"
        @click-right="onSave"
    />

    <van-form class="mt-4">
      <van-cell-group inset>
        <div class="p-4 flex flex-col items-center justify-center border-b border-gray-50">
          <van-uploader
              v-model="fileList"
              :max-count="1"
              :after-read="afterRead"
              @delete="onDeleteLogo"
          >
            <div class="flex flex-col items-center text-gray-400">
              <div class="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300 mb-2">
                <van-icon name="plus" size="24" />
              </div>
              <span class="text-xs">上传项目Logo</span>
            </div>
          </van-uploader>
        </div>

        <van-field
            v-model="form.title"
            label="项目名称"
            placeholder="给项目起个响亮的名字"
            required
            :rules="[{ required: true, message: '请输入项目名称' }]"
        />

        <van-field
            v-model="form.slogan"
            label="Slogan"
            placeholder="一句话介绍项目亮点"
        />

        <van-field
            v-model="domainLabel"
            is-link
            readonly
            label="所属领域"
            placeholder="请选择"
            @click="showPicker = true"
            :rules="[{ required: true, message: '请选择所属领域' }]"
        />
        <van-popup v-model:show="showPicker" round position="bottom">
          <van-picker
              :columns="domainOptions"
              @cancel="showPicker = false"
              @confirm="onDomainConfirm"
          />
        </van-popup>

        <van-field name="teamSize" label="团队规模">
          <template #input>
            <van-stepper v-model="teamSizeNum" min="1" max="50" integer />
            <span class="ml-2 text-gray-500">人</span>
          </template>
        </van-field>

        <van-field
            v-model="form.mentorName"
            label="指导老师"
            placeholder="选填"
        />

        <van-field
            v-model="form.description"
            label="项目简介"
            type="textarea"
            rows="4"
            autosize
            placeholder="详细描述项目背景、痛点、解决方案..."
            show-word-limit
            maxlength="500"
        />

        <van-field
            v-model="form.needs"
            label="人才需求"
            type="textarea"
            rows="3"
            autosize
            placeholder="例如：需要前端开发2名，负责小程序界面..."
            show-word-limit
            maxlength="200"
        />
      </van-cell-group>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProjectDetail, saveProject, getProjectDomains, type ProjectForm } from '@/api/mobile/project'
import { showSuccessToast, showLoadingToast } from 'vant'
import { uploadFile } from '@/api/common' // [新增] 引入上传接口

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

// 表单数据
const form = ref<ProjectForm>({
  id: '',
  title: '',
  logo: '',
  domain: '', // 存 Key (例如 INTERNET_PLUS)
  slogan: '',
  mentorName: '',
  teamSize: '1',
  description: '',
  needs: ''
})

const teamSizeNum = ref(1) //以此绑定 Stepper，提交时转 String
const fileList = ref<any[]>([])

// 字典相关
const showPicker = ref(false)
const domainOptions = ref<{ text: string, value: string }[]>([])
const domainLabel = ref('') // 用于显示中文

// 1. 初始化数据
onMounted(async () => {
  // 加载字典
  await loadDomains()

  // 如果是编辑，回显数据
  if (isEdit.value) {
    await loadDetail(route.params.id as string)
  }
})

// 加载字典 Map -> Options Array
const loadDomains = async () => {
  try {
    const res = await getProjectDomains()
    const map = res.data || {}
    domainOptions.value = Object.entries(map).map(([key, value]) => ({
      text: value,
      value: key
    }))
  } catch (e) {
    console.error(e)
  }
}

// 加载详情并回显
const loadDetail = async (id: string) => {
  try {
    const res = await getProjectDetail(id)
    const data = res.data

    form.value = {
      id: data.projectId,
      title: data.title,
      logo: data.logo,
      domain: '', // 稍后匹配
      slogan: data.slogan,
      mentorName: data.mentorName,
      teamSize: String(data.teamSize),
      description: data.description,
      needs: data.needs
    }

    // 图片回显
    if (data.logo) {
      fileList.value = [{ url: data.logo, isImage: true }]
    }
    // 规模回显
    teamSizeNum.value = Number(data.teamSize) || 1

    // 领域回显 (难点: tags 里是中文，需要反推 Key)
    if (data.tags && data.tags.length > 0) {
      // 假设 tags[0] 是领域中文名
      const label = data.tags[0]
      const found = domainOptions.value.find(opt => opt.text === label)
      if (found) {
        form.value.domain = found.value
        domainLabel.value = found.text
      } else {
        // 没找到匹配的字典，可能就是纯文本，暂时直接显示
        domainLabel.value = label
        form.value.domain = label // 这种情况下 Key 和 Label 一样
      }
    }
  } catch (e) {
    console.error(e)
  }
}

// 选择器确认
const onDomainConfirm = ({ selectedOptions }) => {
  const opt = selectedOptions[0]
  if (opt) {
    domainLabel.value = opt.text
    form.value.domain = opt.value // 存 Key
  }
  showPicker.value = false
}

// [修改] 真实文件上传逻辑
const afterRead = async (fileObj: any) => {
  // 1. 设置状态为上传中
  fileObj.status = 'uploading'
  fileObj.message = '上传中...'

  try {
    // 2. 调用后端上传接口
    // fileObj.file 是原始 File 对象
    const res = await uploadFile(fileObj.file)

    // 3. 上传成功
    fileObj.status = 'done'
    fileObj.message = '上传成功'

    // 4. 将返回的 URL (OSS地址) 赋值给表单
    form.value.logo = res.data // 假设后端直接返回 url 字符串

    // 5. 替换 fileList 中的展示图片，确保预览的是服务器返回的 URL (可选)
    // fileList.value = [{ url: res.data, isImage: true }]

  } catch (error) {
    // 6. 上传失败处理
    fileObj.status = 'failed'
    fileObj.message = '上传失败'
    showFailToast('图片上传失败')
    // 清空 logo 防止提交错误的空值或旧值
    // form.value.logo = ''
  }
}

// [补充] 图片删除事件 (Vant Uploader 自带 delete 事件)
const onDeleteLogo = () => {
  form.value.logo = ''
  fileList.value = []
}

// 保存提交
const onSave = async () => {
  if (!form.value.title) return showSuccessToast('请填写项目名称')
  if (!form.value.domain) return showSuccessToast('请选择所属领域')

  showLoadingToast('保存中...')
  try {
    // 同步 teamSize
    form.value.teamSize = String(teamSizeNum.value)

    await saveProject(form.value)
    showSuccessToast(isEdit.value ? '修改成功' : '发布成功')
    setTimeout(() => router.back(), 500)
  } catch (e) {
    // error
  }
}
</script>