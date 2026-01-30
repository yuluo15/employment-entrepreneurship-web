<!--<template>-->
<!--  <div class="mobile-layout">-->
<!--    <van-nav-bar-->
<!--        v-if="showNavBar"-->
<!--        :title="pageTitle"-->
<!--        fixed-->
<!--        placeholder-->
<!--        z-index="999"-->
<!--    />-->

<!--    <router-view v-slot="{ Component }">-->
<!--      <transition name="van-fade">-->
<!--        <component :is="Component" />-->
<!--      </transition>-->
<!--    </router-view>-->

<!--    <van-tabbar-->
<!--        v-if="showTabBar"-->
<!--        v-model="active"-->
<!--        route-->
<!--        fixed-->
<!--        placeholder-->
<!--        safe-area-inset-bottom-->
<!--    >-->
<!--      <van-tabbar-item replace to="/student/home" icon="home-o">首页</van-tabbar-item>-->
<!--      <van-tabbar-item replace to="/student/jobs" icon="bag-o">职位</van-tabbar-item>-->
<!--      <van-tabbar-item replace to="/student/entrepreneurship" icon="bulb-o">创业</van-tabbar-item>-->
<!--      <van-tabbar-item replace to="/student/profile" icon="user-o">我的</van-tabbar-item>-->
<!--    </van-tabbar>-->
<!--  </div>-->
<!--</template>-->

<template>
  <div class="mobile-layout" ref="scrollContainer">
    <router-view v-slot="{ Component }">
      <transition name="van-fade">
        <keep-alive :include="['StudentJobs', 'StudentHome']">
          <component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>

    <van-tabbar v-if="showTabBar" v-model="active" route fixed placeholder safe-area-inset-bottom>
      <van-tabbar-item replace to="/student/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/student/jobs" icon="bag-o">职位</van-tabbar-item>
      <van-tabbar-item replace to="/student/entrepreneurship" icon="bulb-o">创业</van-tabbar-item>
      <van-tabbar-item replace to="/student/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref(0)

const pageTitle = computed(() => (route.meta.title as string) || '高校就业')
const showNavBar = computed(() => !route.meta.hideNavBar)

// [新增] 计算属性：控制 TabBar 是否显示
const showTabBar = computed(() => !route.meta.hideTabBar)
</script>

<style scoped>
.mobile-layout {
  height: 100vh;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #f7f8fa;
  -webkit-overflow-scrolling: touch;
}
</style>