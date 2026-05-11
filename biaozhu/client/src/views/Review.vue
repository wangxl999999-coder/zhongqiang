<template>
  <div class="page-container">
    <div class="card-container">
      <div class="table-header">
        <h2>审核管理</h2>
      </div>

      <div v-if="!selectedTask" class="task-list">
        <el-table :data="tasks">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="dataName" label="文件名称" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag size="small" :type="taskStatusTagType(row.status)">{{ taskStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" link @click="selectTask(row)">审核</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-else class="review-detail">
        <div class="review-header">
          <el-button @click="selectedTask = null">返回列表</el-button>
          <span style="margin-left: 16px;">任务 #{{ selectedTask.id }} - {{ selectedTask.dataName }}</span>
        </div>

        <div class="review-content">
          <div class="data-preview">
            <div v-if="isImage" class="image-view">
              <img :src="selectedTask.dataPath" />
            </div>
            <div v-else-if="isText" class="text-view">
              <h4>文本内容</h4>
              <p>这是待标注的文本内容示例...</p>
            </div>
            <div v-else-if="isAudio" class="audio-view">
              <audio :src="selectedTask.dataPath" controls style="width: 100%;" />
            </div>
          </div>

          <div class="review-panel">
            <div class="annotation-result">
              <h4>标注结果</h4>
              <div v-if="annotation?.result" class="result-content">
                <pre>{{ JSON.stringify(annotation.result, null, 2) }}</pre>
              </div>
              <div v-else class="empty-result">
                <span>暂无标注结果</span>
              </div>
            </div>

            <div class="review-form">
              <h4>审核操作</h4>
              <el-form :model="reviewForm">
                <el-form-item label="审核意见">
                  <el-input v-model="reviewForm.comment" type="textarea" :rows="4" placeholder="驳回时请填写原因" />
                </el-form-item>
                <el-form-item>
                  <el-button type="success" @click="handleReview(true)" :loading="reviewing">
                    通过
                  </el-button>
                  <el-button type="danger" @click="handleReview(false)" :loading="reviewing" :disabled="!reviewForm.comment">
                    驳回
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import api from '../api';

const tasks = ref([]);
const selectedTask = ref(null);
const annotation = ref(null);
const reviewing = ref(false);

const reviewForm = ref({
  comment: ''
});

const taskStatusText = (status) => {
  const statuses = {
    pending: '待领取', in_progress: '进行中', pending_review: '待审核',
    completed: '已完成', rejected: '已驳回', approved: '已通过'
  };
  return statuses[status] || status;
};

const taskStatusTagType = (status) => {
  const types = {
    pending: '', in_progress: 'primary', pending_review: 'warning',
    completed: 'info', rejected: 'danger', approved: 'success'
  };
  return types[status] || '';
};

const isImage = computed(() => selectedTask.value?.dataPath?.match(/\.(jpg|jpeg|png|gif|webp)$/i));
const isText = computed(() => selectedTask.value?.dataPath?.match(/\.(txt|text)$/i));
const isAudio = computed(() => selectedTask.value?.dataPath?.match(/\.(mp3|wav|ogg|m4a)$/i));

const loadTasks = async () => {
  const response = await api.get('/annotations/review');
  tasks.value = response.data;
};

const selectTask = async (task) => {
  selectedTask.value = task;
  reviewForm.value.comment = '';
  
  const res = await api.get(`/annotations/task/${task.id}`);
  annotation.value = res.data.annotation;
};

const handleReview = async (approved) => {
  if (!approved && !reviewForm.value.comment) {
    ElMessage.warning('驳回时请填写原因');
    return;
  }

  reviewing.value = true;
  try {
    await api.post(`/annotations/task/${selectedTask.value.id}/review`, {
      approved,
      comment: reviewForm.value.comment
    });
    ElMessage.success(approved ? '已通过' : '已驳回');
    selectedTask.value = null;
    loadTasks();
  } catch (error) {
    ElMessage.error('操作失败');
  } finally {
    reviewing.value = false;
  }
};

onMounted(loadTasks);
</script>

<style scoped>
.task-list {
  margin-top: 16px;
}

.review-detail {
  margin-top: 16px;
}

.review-header {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.review-content {
  display: flex;
  gap: 20px;
  min-height: 500px;
}

.data-preview {
  flex: 2;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-view, .text-view, .audio-view {
  padding: 24px;
  max-width: 100%;
}

.image-view img {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.review-panel {
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.annotation-result, .review-form {
  background: white;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
}

.annotation-result h4, .review-form h4 {
  margin-bottom: 16px;
  color: #303133;
}

.result-content pre {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.empty-result {
  text-align: center;
  padding: 40px;
  color: #909399;
}
</style>
