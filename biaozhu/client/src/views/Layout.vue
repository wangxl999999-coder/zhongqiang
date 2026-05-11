<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <h3>数据标注平台</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>工作台</span>
        </el-menu-item>
        
        <el-menu-item v-if="authStore.isAdmin" index="/projects">
          <el-icon><Folder /></el-icon>
          <span>项目管理</span>
        </el-menu-item>
        
        <el-menu-item v-if="authStore.isAnnotator" index="/my-tasks">
          <el-icon><List /></el-icon>
          <span>我的任务</span>
        </el-menu-item>
        
        <el-menu-item v-if="authStore.isAnnotator" index="/task-pool">
          <el-icon><Collection /></el-icon>
          <span>任务领取</span>
        </el-menu-item>
        
        <el-menu-item v-if="authStore.isReviewer || authStore.isAdmin" index="/review">
          <el-icon><DocumentChecked /></el-icon>
          <span>审核管理</span>
        </el-menu-item>
        
        <el-menu-item v-if="authStore.isAdmin" index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <span>欢迎回来，{{ authStore.user?.name }}</span>
          <el-tag size="small" :type="roleTagType">{{ roleText }}</el-tag>
        </div>
        <div class="header-right">
          <el-button type="text" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </el-button>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { HomeFilled, Folder, List, Collection, DocumentChecked, User, SwitchButton } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const activeMenu = computed(() => route.path);

const roleText = computed(() => {
  const roles = { admin: '管理员', annotator: '标注员', reviewer: '审核员' };
  return roles[authStore.user?.role] || '';
});

const roleTagType = computed(() => {
  const types = { admin: 'danger', annotator: 'success', reviewer: 'warning' };
  return types[authStore.user?.role] || '';
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #263445;
}

.logo h3 {
  color: #fff;
  font-size: 18px;
  font-weight: 500;
}

.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #606266;
}
</style>
