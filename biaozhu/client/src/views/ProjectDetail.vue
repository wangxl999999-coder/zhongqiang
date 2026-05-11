<template>
  <div class="page-container">
    <div class="card-container">
      <div class="table-header">
        <h2>{{ project?.name }}</h2>
        <div>
          <el-button @click="router.back()">返回</el-button>
          <el-button type="primary" @click="showUploadDialog = true">上传数据</el-button>
        </div>
      </div>

      <el-descriptions :column="3" border style="margin-bottom: 24px;">
        <el-descriptions-item label="数据类型">{{ dataTypeText(project?.dataType) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(project?.status)">{{ statusText(project?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="任务进度">
          <span>{{ stats.completed }} / {{ stats.total }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="标注教程" :span="3">{{ project?.tutorial || '暂无' }}</el-descriptions-item>
      </el-descriptions>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="任务列表" name="tasks">
          <div class="filter-bar">
            <el-select v-model="taskStatusFilter" placeholder="状态筛选" @change="loadTasks">
              <el-option label="全部" value="" />
              <el-option label="待领取" value="pending" />
              <el-option label="进行中" value="in_progress" />
              <el-option label="待审核" value="pending_review" />
              <el-option label="已完成" value="completed" />
              <el-option label="已驳回" value="rejected" />
              <el-option label="已通过" value="approved" />
            </el-select>
            <el-button type="primary" :disabled="selectedTasks.length === 0" @click="showAssignDialog = true">
              批量分配
            </el-button>
          </div>
          <el-table :data="tasks" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="dataName" label="文件名称" />
            <el-table-column label="分配给">
              <template #default="{ row }">
                {{ row.assignee?.name || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag size="small" :type="taskStatusTagType(row.status)">{{ taskStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="showUploadDialog" title="上传数据" width="600px">
      <el-upload
        :action="uploadUrl"
        :headers="uploadHeaders"
        :data="{ projectId: route.params.id }"
        :on-success="handleUploadSuccess"
        name="files"
        multiple
        :auto-upload="false"
        ref="uploadRef"
      >
        <el-button type="primary">选择文件</el-button>
        <template #tip>
          <div class="el-upload__tip">
            支持批量上传文件，上传后点击开始上传</div>
        </template>
      </el-upload>
      <div style="margin-top: 20px; text-align: right;">
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="uploadFiles">开始上传</el-button>
      </div>
    </el-dialog>

    <el-dialog v-model="showAssignDialog" title="分配任务" width="400px">
      <el-form label-width="80px">
        <el-form-item label="选择标注员">
          <el-select v-model="selectedAnnotator" placeholder="请选择标注员" style="width: 100%">
            <el-option
              v-for="user in annotators"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAssignDialog = false">取消</el-button>
        <el-button type="primary" @click="assignTasks" :loading="assigning">确认分配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import api from '../api';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const project = ref(null);
const tasks = ref([]);
const annotators = ref([]);
const activeTab = ref('tasks');
const taskStatusFilter = ref('');
const selectedTasks = ref([]);
const showUploadDialog = ref(false);
const showAssignDialog = ref(false);
const selectedAnnotator = ref(null);
const assigning = ref(false);
const uploadRef = ref(null);

const stats = computed(() => ({
  total: tasks.value.length,
  completed: tasks.value.filter(t => ['completed', 'approved'].includes(t.status)).length
}));

const uploadUrl = '/api/tasks/upload';
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${authStore.token}`
}));

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

const loadProject = async () => {
  const response = await api.get(`/projects/${route.params.id}`);
  project.value = response.data;
};

const loadTasks = async () => {
  const params = { projectId: route.params.id };
  if (taskStatusFilter.value) params.status = taskStatusFilter.value;
  const response = await api.get('/tasks', { params });
  tasks.value = response.data;
};

const loadAnnotators = async () => {
  const response = await api.get('/auth/users');
  annotators.value = response.data.filter(u => u.role === 'annotator');
};

const handleSelectionChange = (selection) => {
  selectedTasks.value = selection.map(t => t.id);
};

const handleUploadSuccess = () => {
  ElMessage.success('上传成功');
  showUploadDialog.value = false;
  loadTasks();
};

const uploadFiles = () => {
  uploadRef.value.submit();
};

const assignTasks = async () => {
  if (!selectedAnnotator.value) {
    ElMessage.warning('请选择标注员');
    return;
  }
  
  assigning.value = true;
  try {
    await api.post('/tasks/assign', {
      taskIds: selectedTasks.value,
      assignedTo: selectedAnnotator.value
    });
    ElMessage.success('分配成功');
    showAssignDialog.value = false;
    loadTasks();
  } catch (error) {
    ElMessage.error('分配失败');
  } finally {
    assigning.value = false;
  }
};

onMounted(() => {
  loadProject();
  loadTasks();
  loadAnnotators();
});
</script>

<style scoped>
.filter-bar {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}
</style>
