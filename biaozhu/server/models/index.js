const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const Annotation = require('./Annotation');

Project.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Project.hasMany(Task, { foreignKey: 'projectId' });

Task.belongsTo(Project, { foreignKey: 'projectId' });
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo' });
Task.hasOne(Annotation, { foreignKey: 'taskId' });

Annotation.belongsTo(Task, { foreignKey: 'taskId' });
Annotation.belongsTo(User, { as: 'reviewer', foreignKey: 'reviewedBy' });

module.exports = { sequelize, User, Project, Task, Annotation };
