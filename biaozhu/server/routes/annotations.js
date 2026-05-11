const express = require('express');
const { Task, Annotation, Project } = require('../models');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.taskId, {
      include: [{ model: Annotation, as: 'Annotation' }]
    });

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    if (req.user.role === 'annotator' && task.assignedTo !== req.user.id) {
      return res.status(403).json({ error: '无权访问此任务' });
    }

    res.json({
      task,
      annotation: task.Annotation
    });
  } catch (error) {
    res.status(500).json({ error: '获取标注信息失败' });
  }
});

router.post('/task/:taskId', auth, requireRole('annotator'), async (req, res) => {
  try {
    const { result } = req.body;
    const taskId = req.params.taskId;

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    if (task.assignedTo !== req.user.id) {
      return res.status(403).json({ error: '无权修改此任务' });
    }

    let annotation = await Annotation.findOne({ where: { taskId } });
    if (annotation) {
      await annotation.update({ result });
    } else {
      annotation = await Annotation.create({ taskId, result });
    }

    res.json(annotation);
  } catch (error) {
    res.status(500).json({ error: '保存标注失败' });
  }
});

router.post('/task/:taskId/reset', auth, requireRole('annotator'), async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    if (task.assignedTo !== req.user.id) {
      return res.status(403).json({ error: '无权修改此任务' });
    }

    await Annotation.destroy({ where: { taskId } });
    res.json({ message: '重置成功' });
  } catch (error) {
    res.status(500).json({ error: '重置标注失败' });
  }
});

router.get('/review', auth, requireRole('reviewer'), async (req, res) => {
  try {
    const { status } = req.query;
    const where = { status: 'pending_review' };
    if (status) where.status = status;

    const tasks = await Task.findAll({
      where,
      include: [
        { model: Annotation, as: 'Annotation' }
      ],
      order: [['id', 'ASC']]
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: '获取待审核任务失败' });
  }
});

router.post('/task/:taskId/review', auth, requireRole('reviewer'), async (req, res) => {
  try {
    const { approved, comment } = req.body;
    const taskId = req.params.taskId;

    const task = await Task.findByPk(taskId, {
      include: [{ model: Annotation, as: 'Annotation' }]
    });

    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    const newStatus = approved ? 'approved' : 'rejected';
    await task.update({ status: newStatus });

    if (task.Annotation) {
      await task.Annotation.update({
        reviewedBy: req.user.id,
        reviewComment: comment
      });
    } else {
      await Annotation.create({
        taskId,
        reviewedBy: req.user.id,
        reviewComment: comment
      });
    }

    res.json({ message: '审核完成' });
  } catch (error) {
    res.status(500).json({ error: '审核失败' });
  }
});

module.exports = router;
