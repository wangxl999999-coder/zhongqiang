const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Task, Annotation, User } = require('../models');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectDir = path.join(uploadDir, `project_${req.body.projectId}`);
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    cb(null, projectDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + ext;
    cb(null, name);
  }
});

const upload = multer({ storage });

router.post('/upload', auth, requireRole('admin'), upload.array('files'), async (req, res) => {
  try {
    const { projectId } = req.body;
    const files = req.files;

    const tasks = await Promise.all(
      files.map((file) =>
        Task.create({
          projectId,
          dataPath: file.path,
          dataName: file.originalname
        })
      )
    );

    res.status(201).json(tasks);
  } catch (error) {
    res.status(500).json({ error: '上传文件失败' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { projectId, status, assignedTo, myTasks } = req.query;
    const where = {};

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;

    if (myTasks === 'true') {
      where.assignedTo = req.user.id;
    }

    if (req.user.role === 'annotator') {
      where.assignedTo = req.user.id;
    }

    const tasks = await Task.findAll({
      where,
      include: [
        { model: Annotation, as: 'Annotation' },
        { model: User, as: 'assignee', attributes: ['id', 'name'] }
      ],
      order: [['id', 'ASC']]
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: '获取任务列表失败' });
  }
});

router.post('/assign', auth, requireRole('admin'), async (req, res) => {
  try {
    const { taskIds, assignedTo } = req.body;

    await Task.update(
      { assignedTo, status: 'pending' },
      { where: { id: taskIds } }
    );

    res.json({ message: '分配成功' });
  } catch (error) {
    res.status(500).json({ error: '分配任务失败' });
  }
});

router.post('/:id/claim', auth, requireRole('annotator'), async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    if (task.status !== 'pending') {
      return res.status(400).json({ error: '任务状态不允许领取' });
    }

    await task.update({
      assignedTo: req.user.id,
      status: 'in_progress'
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: '领取任务失败' });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    if (req.user.role === 'annotator' && task.assignedTo !== req.user.id) {
      return res.status(403).json({ error: '无权修改此任务' });
    }

    if (req.user.role === 'annotator' && status === 'pending_review') {
      await task.update({ status });
    } else if (req.user.role === 'admin') {
      await task.update({ status });
    } else {
      return res.status(400).json({ error: '无效的状态更新' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: '更新任务状态失败' });
  }
});

router.get('/pending', auth, requireRole('annotator'), async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { status: 'pending', assignedTo: null },
      order: [['id', 'ASC']]
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: '获取可领取任务失败' });
  }
});

module.exports = router;
