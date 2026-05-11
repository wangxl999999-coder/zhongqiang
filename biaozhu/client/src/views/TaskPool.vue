<template>
  <div class="page-container">
    <div class="card-container">
      <div class="table-header">
        <h2>可领取任务</h2>
      </div>

      <el-table :data="tasks">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="dataName" label="文件名称" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag size="small">待领取</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="claimTask(row)" :loading="claiming === row.id">
              领取任务
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import api from '../api';

const router = useRouter();
const tasks = ref([]);
const claiming = ref(null);

const loadTasks = async () => {
  const response = await api.get('/tasks/pending');
  tasks.value = response.data;
};

const claimTask = async (task) => {
  claiming.value = task.id;
  try {
    await api.post(`/tasks/${task.id}/claim`);
    ElMessage.success('领取成功');
    router.push(`/annotate/${task.id}`);
  } catch (error) {
    ElMessage.error(error.response?.data?.error || '领取失败');
  } finally {
    claiming.value = null;
  }
};

onMounted(loadTasks);
</script>
