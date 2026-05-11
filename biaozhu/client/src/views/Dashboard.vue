<template>
  <div class="page-container">
    <h2 style="margin-bottom: 24px; color: #303133;">工作台</h2>
    
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in cards" :key="card.title">
        <div class="stat-card" :style="{ background: card.color }">
          <div class="stat-icon">
            <el-icon :size="40"><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ card.value }}</div>
            <div class="stat-label">{{ card.title }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 24px;">
      <el-col :span="12" v-if="authStore.isAdmin">
        <div class="card-container">
          <h3 style="margin-bottom: 16px;">最新项目</h3>
          <el-table :data="recentProjects" style="width: 100%">
            <el-table-column prop="name" label="项目名称" />
            <el-table-column prop="dataType" label="类型">
              <template #default="{ row }">
                <el-tag size="small">{{ dataTypeText(row.dataType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag size="small" :type="statusTagType(row.status)">{{ statusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      
      <el-col :span="12" v-if="authStore.isAnnotator">
        <div class="card-container">
          <h3 style="margin-bottom: 16px;">我的任务进度</h3>
          <el-progress type="dashboard" :percentage="taskProgress" :color="['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']" />
        </div>
      </el-col>
      
      <el-col :span="12" v-if="authStore.isReviewer">
        <div class="card-container">
          <h3 style="margin-bottom: 16px;">待审核任务</h3>
          <el-progress type="dashboard" :percentage="reviewProgress" :color="['#E6A23C', '#67C23A']" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../api';
import { Folder, Document, UserFilled, DocumentChecked } from '@element-plus/icons-vue';

const authStore = useAuthStore();
const projects = ref([]);
const myTasks = ref([]);
const reviewTasks = ref([]);

const cards = computed(() => {
  const baseCards = [
    { title: '项目总数', value: projects.value.length, color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: Folder }
  ];
  
  if (authStore.isAdmin) {
    return [
      ...baseCards,
      { title: '总任务数', value: myTasks.value.total || 0, color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: Document },
      { title: '标注员', value: 0, color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: UserFilled },
      { title: '已完成', value: myTasks.value.completed || 0, color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', icon: DocumentChecked }
    ];
  }
  
  if (authStore.isAnnotator) {
    return [
      { title: '我的任务', value: myTasks.value.total || 0, color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: Document },
      { title: '进行中', value: myTasks.value.inProgress || 0, color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: Document },
      { title: '待审核', value: myTasks.value.pendingReview || 0, color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: Document },
      { title: '已完成', value: myTasks.value.completed || 0, color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', icon: DocumentChecked }
    ];
  }
  
  return baseCards;
});

const taskProgress = computed(() => {
  const total = myTasks.value.total || 0;
  const completed = myTasks.value.completed || 0;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
});

const reviewProgress = computed(() => {
  const total = reviewTasks.value.total || 0;
  const reviewed = reviewTasks.value.reviewed || 0;
  return total > 0 ? Math.round((reviewed / total) * 100) : 0;
});

const recentProjects = computed(() => projects.value.slice(0, 5));

const dataTypeText = (type) => {
  const types = { image: '图片', text: '文本', audio: '音频' };
  return types[type] || type;
};

const statusText = (status) => {
  const statuses = { draft: '草稿', active: '进行中', paused: '已暂停', completed: '已完成' };
  return statuses[status] || status;
};

const statusTagType = (status) => {
  const types = { draft: 'info', active: 'success', paused: 'warning', completed: '' };
  return types[status] || '';
};

const loadData = async () => {
  try {
    const [projectsRes, tasksRes] = await Promise.all([
      api.get('/projects'),
      authStore.isAnnotator ? api.get('/tasks?myTasks=true') : api.get('/tasks')
    ]);
    projects.value = projectsRes.data;
    
    const tasks = tasksRes.data;
    myTasks.value = {
      total: tasks.length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      pendingReview: tasks.filter(t => t.status === 'pending_review').length,
      completed: tasks.filter(t => t.status === 'completed' || t.status === 'approved').length
    };
  } catch (error) {
    console.error('加载数据失败', error);
  }
};

onMounted(loadData);
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
}

.stat-icon {
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}
</style>
