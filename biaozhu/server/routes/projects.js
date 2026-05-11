const express = require('express');
const { Project, Task, Annotation } = require('../models');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) {
      where.status = status;
    }

    const projects = await Project.findAll({
      where,
      order: [['id', 'DESC']]
    });

    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.findAll({ where: { projectId: project.id } });
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed' || t.status === 'approved').length;
        const pendingReview = tasks.filter(t => t.status === 'pending_review').length;

        return {
          ...project.toJSON(),
          stats: { total, completed, pendingReview }
        };
      })
    );

    res.json(projectsWithStats);
  } catch (error) {
    res.status(500).json({ error: '获取项目列表失败' });
  }
});

router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, dataType, tutorial, status } = req.body;
    const project = await Project.create({
      name,
      dataType,
      tutorial,
      status: status || 'draft',
      createdBy: req.user.id
    });
    res.status(201).json(project);
  } catch (error) {
    console.error('创建项目错误:', error);
    res.status(500).json({ error: '创建项目失败', details: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    const tasks = await Task.findAll({ where: { projectId: project.id } });
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed' || t.status === 'approved').length;
    const pendingReview = tasks.filter(t => t.status === 'pending_review').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;

    res.json({
      ...project.toJSON(),
      stats: { total, completed, pendingReview, inProgress }
    });
  } catch (error) {
    res.status(500).json({ error: '获取项目详情失败' });
  }
});

router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, dataType, tutorial, status } = req.body;
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    await project.update({ name, dataType, tutorial, status });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: '更新项目失败' });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    await Task.destroy({ where: { projectId: project.id } });
    await project.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除项目失败' });
  }
});

module.exports = router;
