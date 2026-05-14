# 热榜聚合平台

一站式查看全网热搜聚合信息的Web应用，聚合知乎、B站、抖音、小红书等多个平台的热榜内容。

## ✨ 功能特性

- 🔄 **多平台聚合**：支持知乎、B站、抖音、小红书等平台的热榜内容
- ⏰ **自动爬取**：每小时自动爬取各平台热门信息，启动时自动执行初始爬取
- 🔍 **全局搜索**：根据关键词搜索全网所有平台热搜
- 🏷️ **分类筛选**：按娱乐、科技、财经、社会、体育、游戏、职场等分类筛选
- 📊 **多种排序**：支持按热度和时间排序
- 🔗 **事件聚合**：全网相同事件自动聚合，标注多平台同步上榜
- ❤️ **收藏功能**：感兴趣的话题可以收藏（需要登录
- 🔕 **关键词屏蔽**：设置屏蔽关键词后不展示相关话题
- 👤 **用户系统**：手机号+验证码登录注册

## 🛠️ 技术栈

### 后端
- Node.js + Express
- SQLite3 数据库
- Axios + Cheerio 爬虫
- JWT 用户认证
- node-cron 定时任务

### 前端
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide Icons

## 📦 安装步骤

### 前置要求
- Node.js >= 16.x
- npm 或 yarn

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd rebang
```

### 2. 安装后端依赖
```bash
cd server
npm install
```

### 3. 安装前端依赖
```bash
cd ../client
npm install
```

### 4. 配置环境变量（可选
在 `server` 目录下的 `.env` 文件：
```env
PORT=3002
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
```

## 🚀 运行项目

### 方式一：分别启动（推荐开发使用）

1. 启动后端服务
```bash
cd server
npm start
```
后端服务将运行在 http://localhost:3002

2. 启动前端服务（新开终端）
```bash
cd client
npm run dev
```
前端服务将运行在 http://localhost:3000

## 📖 使用说明

### 登录注册
1. 点击右上角"登录"按钮
2. 输入任意手机号（如 13800138000
3. 点击"获取验证码"
4. **验证码会输出在后端控制台，控制台，查看后端终端窗口
5. 输入验证码，点击"登录/注册"

### 查看热榜
- 首页默认展示所有平台24小时内的热榜内容
- 可通过顶部筛选栏选择特定平台
- 支持按分类筛选（娱乐、科技、财经等）
- 可切换排序方式（按热度/按时间）

### 搜索功能
- 在顶部搜索框输入关键词
- 按回车键或点击搜索图标进行搜索
- 搜索结果包含所有平台相关的热榜内容

### 收藏话题
- 登录后点击热榜卡片上的心形图标可收藏
- 再次点击可取消收藏

### 多平台标识
- 橙色标签"X平台上榜"表示该事件在多个平台同时上榜

## 🔧 API 接口

- `GET /api/health` - 健康检查
- `GET /api/hotlist` - 获取热榜列表
- `GET /api/hotlist/platforms` - 获取平台列表
- `GET /api/hotlist/categories` - 获取分类列表
- `POST /api/auth/send-code` - 发送验证码
- `POST /api/auth/login` - 登录
- `GET /api/hotlist/favorites` - 获取收藏列表
- `POST /api/hotlist/favorites/:id` - 添加收藏
- `DELETE /api/hotlist/favorites/:id` - 取消收藏

## 🕷️ 爬虫说明

### 支持的平台
- 知乎热榜
- B站热门
- 抖音热榜
- 小红书热门

### 定时任务
- 每小时自动执行一次爬取
- 启动时会执行一次初始爬取
- 自动清理7天前的旧数据

### 手动触发爬取
```bash
cd server
node src/scripts/crawl.js
```

## 🔒 安全建议

1. 生产环境请修改 `JWT_SECRET` 为强随机字符串
2. 建议使用HTTPS
3. 接入真实的短信服务发送验证码
4. 定期备份数据库
5. 配置适当的请求频率限制

## 📝 注意事项

1. **验证码查看**：开发环境下，验证码会输出到后端控制台，实际部署时需要接入短信服务
2. **数据来源**：由于各平台API限制，部分平台可能使用模拟数据，实际使用时需要配置真实API
3. **数据库**：使用SQLite，数据库文件位于 `server/data/rebang.db
4. **CORS配置**：开发环境已配置代理，生产环境需要配置相应的CORS策略

## 📂 项目结构

```
rebang/
├── server/                 # 后端服务
│   ├── src/
│   │   ├── database/       # 数据库相关
│   │   ├── crawlers/       # 各平台爬虫
│   │   ├── services/       # 业务逻辑
│   │   ├── routes/         # API路由
│   │   ├── scripts/        # 脚本文件
│   │   └── index.js        # 入口文件
│   ├── data/               # 数据库文件（自动生成）
│   ├── package.json
│   └── .env
├── client/                 # 前端应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   ├── contexts/       # Context
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License
