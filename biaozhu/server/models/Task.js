const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dataPath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dataName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'pending_review', 'completed', 'rejected', 'approved'),
    allowNull: false,
    defaultValue: 'pending'
  }
});

module.exports = Task;
