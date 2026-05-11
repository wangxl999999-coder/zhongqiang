<template>
  <div class="page-container">
    <div class="card-container">
      <div class="table-header">
        <h2>我的任务</h2>
        <div>
          <el-select v-model="statusFilter" placeholder="状态筛选" @change="loadTasks" clearable>
            <el-option label="进行中" value="in_progress" />
            <el-option label="待审核" value="pending_review" />
            <el-option label="已完成" value="completed" />
            <el-option label="已驳回" value="rejected" />
            <el-option label="已通过" value="approved" />
          </el-select>
        </div>
      </div>

      <el-table :data="tasks">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="dataName" label="文件名称" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag size="small" :type="taskStatusTagType(row.status)">{{ taskStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button v-if="row.status === 'in_progress' || row.status === 'rejected'" type="primary" link @click="startAnnotate(row)">
              开始标注
            </el-button>
            <el-button v-else-if="row.status === 'pending_review'" type="primary" link @click="startAnnotate(row)">
              查看标注
            </el-button>
            <el-button v-else link @click="startAnnotate(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';

const router = useRouter();
const tasks = ref([]);
const statusFilter = ref('');

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

const loadTasks = async () => {
  const params = { myTasks: 'true' };
  if (statusFilter.value) params.status = statusFilter.value;
  const response = await api.get('/tasks', { params });
  tasks.value = response.data;
};

const startAnnotate = (task) => {
  router.push(`/annotate/${task.id}`);
};

onMounted(loadTasks);
</script>
