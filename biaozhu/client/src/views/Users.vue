<template>
  <div class="page-container">
    <div class="card-container">
      <div class="table-header">
        <h2>用户管理</h2>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建用户
        </el-button>
      </div>

      <el-table :data="users">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag size="small" :type="roleTagType(row.role)">{{ roleText(row.role) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="showCreateDialog" title="新建用户" width="400px">
      <el-form :model="userForm" :rules="userRules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="标注员" value="annotator" />
            <el-option label="审核员" value="reviewer" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createUser" :loading="creating">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import api from '../api';

const users = ref([]);
const showCreateDialog = ref(false);
const creating = ref(false);
const formRef = ref(null);

const userForm = reactive({
  username: '',
  password: '',
  name: '',
  role: 'annotator'
});

const userRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
};

const roleText = (role) => {
  const roles = { admin: '管理员', annotator: '标注员', reviewer: '审核员' };
  return roles[role] || role;
};

const roleTagType = (role) => {
  const types = { admin: 'danger', annotator: 'success', reviewer: 'warning' };
  return types[role] || '';
};

const loadUsers = async () => {
  const response = await api.get('/auth/users');
  users.value = response.data;
};

const createUser = async () => {
  await formRef.value.validate();
  creating.value = true;
  
  try {
    await api.post('/auth/register', userForm);
    ElMessage.success('创建成功');
    showCreateDialog.value = false;
    userForm.username = '';
    userForm.password = '';
    userForm.name = '';
    userForm.role = 'annotator';
    loadUsers();
  } catch (error) {
    ElMessage.error(error.response?.data?.error || '创建失败');
  } finally {
    creating.value = false;
  }
};

onMounted(loadUsers);
</script>
