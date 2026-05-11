const express = require('express');
const { Project, Task, Annotation } = require('../models');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const project = await Project.findByPk(req.params.projectId);

    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    const tasks = await Task.findAll({
      where: { 
        projectId: project.id,
        status: ['completed', 'approved']
      },
      include: [{ model: Annotation, as: 'Annotation' }]
    });

    if (format === 'coco' && project.dataType === 'image') {
      const coco = {
        info: {
          description: project.name,
          date_created: new Date().toISOString()
        },
        images: [],
        annotations: [],
        categories: []
      };

      tasks.forEach((task, index) => {
        coco.images.push({
          id: index,
          file_name: task.dataName,
          task_id: task.id
        });

        if (task.Annotation?.result) {
          const result = task.Annotation.result;
          if (result.annotations) {
            result.annotations.forEach((ann, annIndex) => {
              coco.annotations.push({
                id: index * 1000 + annIndex,
                image_id: index,
                category_id: ann.category_id || 1,
                bbox: ann.bbox,
                segmentation: ann.segmentation,
                area: ann.area
              });
            });
          }
        }
      });

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${project.name}_coco.json`);
      return res.json(coco);
    }

    const annotations = tasks.map(task => ({
      taskId: task.id,
      fileName: task.dataName,
      result: task.Annotation?.result || null
    }));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${project.name}.json`);
    res.json({
      project: {
        id: project.id,
        name: project.name,
        dataType: project.dataType
      },
      annotations
    });
  } catch (error) {
    res.status(500).json({ error: '导出失败' });
  }
});

module.exports = router;
