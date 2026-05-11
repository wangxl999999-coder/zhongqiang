<template>
  <div class="annotate-container">
    <div class="annotate-header">
      <div class="header-left">
        <el-button @click="goBack">返回</el-button>
        <span style="margin-left: 16px;">任务 {{ currentIndex + 1 }} / {{ tasks.length }}</span>
      </div>
      <div class="header-right">
        <el-button @click="resetAnnotation">重置标注</el-button>
        <el-button type="primary" @click="saveAnnotation" :loading="saving">保存</el-button>
        <el-button type="success" @click="submitReview" :loading="submitting">提交审核</el-button>
        <el-button @click="nextTask" :disabled="currentIndex >= tasks.length - 1">下一项</el-button>
      </div>
    </div>

    <div class="annotate-content">
      <div class="data-panel">
        <div v-if="project?.dataType === 'image'" class="image-container">
          <img :src="currentTask?.dataPath" alt="待标注图片" ref="imageRef" @load="onImageLoad" />
          <canvas ref="canvasRef" class="annotation-canvas" @mousedown="startDraw" @mousemove="onMouseMove" @mouseup="endDraw" @mouseleave="endDraw" />
        </div>
        <div v-else-if="project?.dataType === 'text'" class="text-container">
          <h4>文本内容</h4>
          <el-input v-model="textContent" type="textarea" :rows="10" readonly />
        </div>
        <div v-else-if="project?.dataType === 'audio'" class="audio-container">
          <audio :src="currentTask?.dataPath" controls style="width: 100%;" />
        </div>
      </div>

      <div class="annotation-panel">
        <div class="panel-header">
          <h3>标注信息</h3>
        </div>

        <div class="annotation-form">
          <el-form :model="annotationForm" label-width="100px">
            <template v-if="project?.dataType === 'image'">
              <el-form-item label="标注类型">
                <el-select v-model="currentTool" placeholder="选择标注类型" style="width: 100%">
                  <el-option label="矩形框" value="rect" />
                  <el-option label="点" value="point" />
                </el-select>
              </el-form-item>
              <el-form-item label="类别标签">
                <el-input v-model="currentLabel" placeholder="输入类别名称" />
              </el-form-item>
              <el-form-item label="已标注">
                <div class="annotation-list">
                  <div v-for="(ann, index) in annotations" :key="index" class="annotation-item">
                    <span>{{ ann.label }}</span>
                    <el-button type="danger" link size="small" @click="removeAnnotation(index)">删除</el-button>
                  </div>
                </div>
              </el-form-item>
            </template>

            <template v-else-if="project?.dataType === 'text'">
              <el-form-item label="分类标签">
                <el-input v-model="annotationForm.textClass" placeholder="输入文本分类" />
              </el-form-item>
              <el-form-item label="关键词">
                <el-input v-model="annotationForm.keywords" type="textarea" placeholder="输入关键词，用逗号分隔" />
              </el-form-item>
            </template>

            <template v-else-if="project?.dataType === 'audio'">
              <el-form-item label="语音转写">
                <el-input v-model="annotationForm.transcript" type="textarea" :rows="6" placeholder="输入语音转写内容" />
              </el-form-item>
              <el-form-item label="情感标签">
                <el-select v-model="annotationForm.emotion" placeholder="选择情感" style="width: 100%">
                  <el-option label="正面" value="positive" />
                  <el-option label="中性" value="neutral" />
                  <el-option label="负面" value="negative" />
                </el-select>
              </el-form-item>
            </template>
          </el-form>
        </div>

        <div v-if="taskAnnotation?.reviewComment" class="reject-info">
          <h4>驳回原因：</h4>
          <p>{{ taskAnnotation.reviewComment }}</p>
        </div>

        <div class="tutorial-section" v-if="project?.tutorial">
          <h4>标注教程：</h4>
          <p>{{ project.tutorial }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '../api';

const route = useRoute();
const router = useRouter();

const tasks = ref([]);
const currentIndex = ref(0);
const project = ref(null);
const currentTask = ref(null);
const taskAnnotation = ref(null);
const saving = ref(false);
const submitting = ref(false);

const imageRef = ref(null);
const canvasRef = ref(null);
const isDrawing = ref(false);
const currentTool = ref('rect');
const currentLabel = ref('');
const annotations = ref([]);

const textContent = ref('这是一段待标注的示例文本内容。请根据标注教程进行分类和关键词提取。');

const annotationForm = reactive({
  textClass: '',
  keywords: '',
  transcript: '',
  emotion: ''
});

const currentTaskId = computed(() => route.params.taskId);

const loadTasks = async () => {
  const response = await api.get('/tasks', { params: { myTasks: 'true' } });
  tasks.value = response.data.filter(t => ['in_progress', 'rejected', 'pending_review'].includes(t.status));
  currentIndex.value = tasks.value.findIndex(t => t.id === parseInt(currentTaskId.value));
  if (currentIndex.value === -1) currentIndex.value = 0;
};

const loadCurrentTask = async () => {
  if (!tasks.value.length) return;
  const task = tasks.value[currentIndex.value];
  currentTask.value = task;
  
  const projectRes = await api.get(`/projects/${task.projectId}`);
  project.value = projectRes.data;
  
  const annotationRes = await api.get(`/annotations/task/${task.id}`);
  taskAnnotation.value = annotationRes.data.annotation;
  
  if (taskAnnotation.value?.result) {
    const result = taskAnnotation.value.result;
    annotations.value = result.annotations || [];
    annotationForm.textClass = result.textClass || '';
    annotationForm.keywords = result.keywords || '';
    annotationForm.transcript = result.transcript || '';
    annotationForm.emotion = result.emotion || '';
  } else {
    annotations.value = [];
    annotationForm.textClass = '';
    annotationForm.keywords = '';
    annotationForm.transcript = '';
    annotationForm.emotion = '';
  }
  
  await nextTick();
  drawCanvas();
};

const drawCanvas = () => {
  if (!canvasRef.value || !imageRef.value) return;
  
  const canvas = canvasRef.value;
  const image = imageRef.value;
  canvas.width = image.width;
  canvas.height = image.height;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 2;
  
  annotations.value.forEach(ann => {
    if (ann.type === 'rect') {
      ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
      ctx.fillStyle = '#ff0000';
      ctx.font = '12px sans-serif';
      ctx.fillText(ann.label, ann.x, ann.y - 5);
    } else if (ann.type === 'point') {
      ctx.beginPath();
      ctx.arc(ann.x, ann.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ff0000';
      ctx.fill();
      ctx.fillText(ann.label, ann.x + 10, ann.y);
    }
  });
};

const onImageLoad = () => {
  drawCanvas();
};

const startDraw = (e) => {
  if (!currentLabel.value) {
    ElMessage.warning('请先输入类别标签');
    return;
  }
  
  const rect = canvasRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  if (currentTool.value === 'point') {
    annotations.value.push({
      type: 'point',
      x,
      y,
      label: currentLabel.value
    });
    drawCanvas();
  } else {
    isDrawing.value = true;
    annotations.value.push({
      type: 'rect',
      x,
      y,
      width: 0,
      height: 0,
      label: currentLabel.value
    });
  }
};

const onMouseMove = (e) => {
  if (!isDrawing.value || annotations.value.length === 0) return;
  
  const rect = canvasRef.value.getBoundingClientRect();
  const lastAnn = annotations.value[annotations.value.length - 1];
  lastAnn.width = (e.clientX - rect.left) - lastAnn.x;
  lastAnn.height = (e.clientY - rect.top) - lastAnn.y;
  drawCanvas();
};

const endDraw = () => {
  isDrawing.value = false;
};

const removeAnnotation = (index) => {
  annotations.value.splice(index, 1);
  drawCanvas();
};

const getResultData = () => {
  if (project.value.dataType === 'image') {
    return { annotations: annotations.value };
  } else if (project.value.dataType === 'text') {
    return {
      textClass: annotationForm.textClass,
      keywords: annotationForm.keywords
    };
  } else if (project.value.dataType === 'audio') {
    return {
      transcript: annotationForm.transcript,
      emotion: annotationForm.emotion
    };
  }
  return {};
};

const saveAnnotation = async () => {
  saving.value = true;
  try {
    await api.post(`/annotations/task/${currentTask.value.id}`, {
      result: getResultData()
    });
    ElMessage.success('保存成功');
  } catch (error) {
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
};

const resetAnnotation = async () => {
  await ElMessageBox.confirm('确定要重置标注信息吗？', '确认重置', { type: 'warning' });
  
  await api.post(`/annotations/task/${currentTask.value.id}/reset`);
  annotations.value = [];
  annotationForm.textClass = '';
  annotationForm.keywords = '';
  annotationForm.transcript = '';
  annotationForm.emotion = '';
  drawCanvas();
  ElMessage.success('已重置');
};

const submitReview = async () => {
  await ElMessageBox.confirm('确定提交审核吗？提交后将无法修改。', '确认提交', { type: 'warning' });
  
  submitting.value = true;
  try {
    await api.post(`/annotations/task/${currentTask.value.id}`, {
      result: getResultData()
    });
    await api.put(`/tasks/${currentTask.value.id}/status`, {
      status: 'pending_review'
    });
    ElMessage.success('已提交审核');
    goBack();
  } catch (error) {
    ElMessage.error('提交失败');
  } finally {
    submitting.value = false;
  }
};

const nextTask = () => {
  if (currentIndex.value < tasks.value.length - 1) {
    currentIndex.value++;
    loadCurrentTask();
  }
};

const goBack = () => {
  router.push('/my-tasks');
};

onMounted(async () => {
  await loadTasks();
  await loadCurrentTask();
});

watch(currentIndex, () => {
  loadCurrentTask();
});
</script>

<style scoped>
.annotate-container {
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.annotate-header {
  background: white;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.annotate-content {
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
  overflow: hidden;
}

.data-panel {
  flex: 2;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.image-container {
  position: relative;
  max-width: 100%;
  max-height: 100%;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.annotation-canvas {
  position: absolute;
  top: 0;
  left: 0;
  cursor: crosshair;
}

.text-container, .audio-container {
  width: 100%;
  padding: 24px;
}

.annotation-panel {
  width: 380px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.annotation-form {
  padding: 20px;
  flex: 1;
}

.annotation-list {
  max-height: 200px;
  overflow-y: auto;
}

.annotation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

.reject-info {
  margin: 0 20px;
  padding: 16px;
  background: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;
}

.reject-info h4 {
  color: #f56c6c;
  margin-bottom: 8px;
}

.tutorial-section {
  margin: 20px;
  padding: 16px;
  background: #ecf5ff;
  border-radius: 4px;
}

.tutorial-section h4 {
  color: #409EFF;
  margin-bottom: 8px;
}
</style>
