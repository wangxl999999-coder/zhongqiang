# API接口平台

一个专业的API接口服务平台，支持用户注册登录、金币系统、推广返利、淘宝/天猫数据采集等功能。

## 功能特性

- 👤 **用户系统**
- 注册/登录、JWT认证、API_KEY管理

💰 **金币系统**
- 注册赠送10金币
- 充值比例：1元 = 100金币
- 金币有效期：365天
- 接口调用消耗：1金币/次

🎁 **推广系统**
- 推广链接生成
- 10%返利比例
- 推广关系永久绑定

📦 **数据接口**
- 淘宝商品详情采集
- 天猫商品详情采集
- 接口测试功能

📊 **统计功能**
- 购买统计（充值、赠送、返利记录）
- 消费统计（API调用记录）

## 技术栈

- **后端**: Python + FastAPI
- **数据库**: MySQL
- **前端**: 原生HTML/CSS/JavaScript
- **认证**: JWT + 密码哈希
- **数据加密**: bcrypt

## 安装步骤

### 1. 环境要求

- Python 3.8+
- MySQL 5.7+

### 2. 快速开始

#### 方式一：使用初始化脚本

```bash
# 克隆项目后，运行：
python init_db.py
```

#### 方式二：手动安装

1. 安装依赖：

```bash
pip install -r requirements.txt
```

2. 配置数据库：

修改 `.env` 文件中的数据库连接信息：

```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/api_platform
```

3. 启动服务：

```bash
python run.py
```

### 3. 访问地址

- 前端页面: http://localhost:8000
- API文档: http://localhost:8000/docs

## API接口说明

### 认证接口
- `POST /api/auth/register - 用户注册
- `POST /api/auth/login - 用户登录

### 用户接口
- `GET /api/user/profile - 获取用户信息
- `POST /api/user/recharge - 充值
- `GET /api/user/promotion - 获取推广信息
- `GET /api/user/statistics - 获取统计数据
- `GET /api/user/purchase-list - 购买记录
- `GET /api/user/consumption-list - 消费记录

### 数据接口（需在请求头携带 `X-API-Key`

- `GET /api/v1/test - 测试接口
- `GET /api/v1/taobao/detail?url=... - 淘宝详情采集
- `GET /api/v1/tmall/detail?url=... - 天猫详情采集

## 项目结构

```
api/
├── app/
│   ├── __init__.py
│   ├── main.py              # 主应用
│   ├── config.py            # 配置
│   ├── database.py          # 数据库连接
│   ├── models.py          # 数据模型
│   ├── schemas.py        # Pydantic模型
│   ├── utils.py         # 工具函数
│   ├── dependencies.py  # 依赖
│   ├── scraper.py    # 采集器
│   └── routers/
│       ├── __init__.py
│       ├── auth.py     # 认证路由
│       ├── user.py    # 用户路由
│       └── api.py     # API路由
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── api.js
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── api-keys.html
│   ├── recharge.html
│   ├── promotion.html
│   ├── api-test.html
│   └── statistics.html
├── requirements.txt
├── run.py
├── init_db.py
└── .env
└── .env.example
```

## 使用说明

1. **注册账户**
   - 访问 http://localhost:8000
   - 点击"立即注册"，填写用户名、邮箱、密码
   - 注册成功后获得 10 金币

2. **获取API_KEY**
   - 登录后进入"API密钥"页面
   - 复制您的 API_KEY

3. **调用接口**
   ```bash
   curl -X GET "http://localhost:8000/api/v1/taobao/detail?url=商品链接" \
     -H "X-API-Key: 您的API_KEY"
   ```

4. **充值金币**
   - 进入"充值"页面
   - 选择金额或输入自定义金额

5. **推广返利**
   - 进入"推广"页面
   - 复制推广链接分享给好友
   - 好友充值后获得 10% 返利
