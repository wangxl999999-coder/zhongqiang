const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const annotationRoutes = require('./routes/annotations');
const exportRoutes = require('./routes/export');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/annotations', annotationRoutes);
app.use('/api/export', exportRoutes);

const initDatabase = async () => {
  await sequelize.sync({ force: false });
  
  const adminExists = await User.findOne({ where: { role: 'admin' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      name: '系统管理员'
    });
    
    await User.create({
      username: 'annotator',
      password: await bcrypt.hash('annotator123', 10),
      role: 'annotator',
      name: '标注员示例'
    });
    
    await User.create({
      username: 'reviewer',
      password: await bcrypt.hash('reviewer123', 10),
      role: 'reviewer',
      name: '审核员示例'
    });
    
    console.log('已创建默认用户:');
    console.log('管理员: admin / admin123');
    console.log('标注员: annotator / annotator123');
    console.log('审核员: reviewer / reviewer123');
  }
};

app.listen(PORT, async () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  await initDatabase();
});
