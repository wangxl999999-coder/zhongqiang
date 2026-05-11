<template>
  <div class="page-container">
    <div class="card-container">
      <div class="table-header">
        <h2>项目管理</h2>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建项目
        </el-button>
      </div>

      <div class="filter-bar">
        <span>状态筛选：</span>
        <el-radio-group v-model="filterStatus" @change="loadProjects">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="draft">草稿</el-radio-button>
          <el-radio-button label="active">进行中</el-radio-button>
          <el-radio-button label="paused">已暂停</el-radio-button>
          <el-radio-button label="completed">已完成</el-radio-button>
        </el-radio-group>
      </div>

      <el-table :data="projects" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="项目名称" />
        <el-table-column prop="dataType" label="数据类型">
          <template #default="{ row }">
            <el-tag size="small">{{ dataTypeText(row.dataType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="任务进度">
          <template #default="{ row }">
            <el-progress :percentage="getProgress(row)" :stroke-width="12" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag size="small" :type="statusTagType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button type="primary" link @click="goToDetail(row)">管理</el-button>
            <el-button link @click="editProject(row)">编辑</el-button>
            <el-button type="primary" link @click="exportProject(row)">导出</el-button>
            <el-button type="danger" link @click="deleteProject(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="showCreateDialog" :title="editingProject ? '编辑项目' : '新建项目'" width="500px">
      <el-form :model="projectForm" :rules="projectRules" ref="formRef" label-width="80px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="projectForm.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="数据类型" prop="dataType">
          <el-select v-model="projectForm.dataType" placeholder="请选择数据类型" style="width: 100%">
            <el-option label="图片" value="image" />
            <el-option label="文本" value="text" />
            <el-option label="音频" value="audio" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目状态" prop="status">
          <el-select v-model="projectForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="草稿" value="draft" />
            <el-option label="进行中" value="active" />
            <el-option label="已暂停" value="paused" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="标注教程">
          <el-input v-model="projectForm.tutorial" type="textarea" :rows="4" placeholder="请输入标注教程或说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProject" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import api from '../api';

const router = useRouter();
const projects = ref([]);
const filterStatus = ref('');
const showCreateDialog = ref(false);
const editingProject = ref(null);
const saving = ref(false);
const formRef = ref(null);

const projectForm = reactive({
  name: '',
  dataType: '',
  status: 'draft',
  tutorial: ''
});

const projectRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  dataType: [{ required: true, message: '请选择数据类型', trigger: 'change' }]
};

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

const getProgress = (row) => {
  if (!row.stats || row.stats.total === 0) return 0;
  return Math.round((row.stats.completed / row.stats.total) * 100);
};

const loadProjects = async () => {
  const params = filterStatus.value ? { status: filterStatus.value } : {};
  const response = await api.get('/projects', { params });
  projects.value = response.data;
};

const editProject = (project) => {
  editingProject.value = project;
  Object.assign(projectForm, {
    name: project.name,
    dataType: project.dataType,
    status: project.status,
    tutorial: project.tutorial || ''
  });
  showCreateDialog.value = true;
};

const saveProject = async () => {
  await formRef.value.validate();
  saving.value = true;
  
  try {
    if (editingProject.value) {
      await api.put(`/projects/${editingProject.value.id}`, projectForm);
      ElMessage.success('更新成功');
    } else {
      await api.post('/projects', projectForm);
      ElMessage.success('创建成功');
    }
    showCreateDialog.value = false;
    loadProjects();
  } catch (error) {
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
};

const deleteProject = async (project) => {
  await ElMessageBox.confirm('确定要删除该项目吗？删除后无法恢复。', '确认删除', {
    type: 'warning'
  });
  
  await api.delete(`/projects/${project.id}`);
  ElMessage.success('删除成功');
  loadProjects();
};

const goToDetail = (project) => {
  router.push(`/projects/${project.id}`);
};

const exportProject = (project) => {
  window.open(`/api/export/project/${project.id}`, '_blank');
};

onMounted(loadProjects);
</script>

<style scoped>
.filter-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
