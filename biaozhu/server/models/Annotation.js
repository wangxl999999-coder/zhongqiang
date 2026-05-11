const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Annotation = sequelize.define('Annotation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  result: {
    type: DataTypes.JSON,
    allowNull: true
  },
  reviewedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  reviewComment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Annotation;
