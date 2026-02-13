<template>
  <div class="teacher-layout">
    <router-view v-slot="{ Component }">
      <transition name="van-fade">
        <keep-alive :include="['TeacherHome', 'TeacherProjects']">
          <component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>

    <van-tabbar v-if="showTabBar" v-model="active" route fixed placeholder safe-area-inset-bottom>
      <van-tabbar-item replace to="/teacher/home" icon="home-o">
        工作台
      </van-tabbar-item>
      <van-tabbar-item replace to="/teacher/projects" icon="bulb-o" :badge="pendingCount || ''">
        项目
      </van-tabbar-item>
      <van-tabbar-item replace to="/teacher/guidance" icon="records-o">
        指导
      </van-tabbar-item>
      <van-tabbar-item replace to="/teacher/profile" icon="user-o">
        我的
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTeacherStore } from '@/store/teacherStore'

const route = useRoute()
const teacherStore = useTeacherStore()
const active = ref(0)

// 计算属性：控制 TabBar 是否显示
const showTabBar = computed(() => !route.meta.hideTabBar)

// 待指导项目数量（用于角标）
const pendingCount = computed(() => teacherStore.pendingCount)
</script>

<style scoped>
.teacher-layout {
  height: 100vh;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #f7f8fa;
  -webkit-overflow-scrolling: touch;
}
</style>
