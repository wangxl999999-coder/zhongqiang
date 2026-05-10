# 问卷系统

一款功能完整的在线问卷系统，支持拖拽式编辑、条件跳转、数据统计等功能。

## 功能特性

### 核心功能
- ✅ **拖拽式编辑** - 支持9种题型（单选、多选、单行文本、多行文本、下拉框、评分、日期、文件上传、段落说明）
- ✅ **题目管理** - 支持题目复制、删除、必选设置
- ✅ **段落与分页** - 支持添加段落说明和多页问卷
- ✅ **条件跳转** - 基于某题选项跳转到指定题目或结束
- ✅ **条件显示/隐藏** - 基于某题选项控制后续题目显示状态
- ✅ **公开链接与二维码** - 生成公开分享链接和二维码
- ✅ **回收限制** - 支持截止时间、最大份数、限答一次（按IP限制）
- ✅ **密码访问** - 可设置访问密码保护问卷隐私
- ✅ **图表统计** - 自动生成饼图、柱状图统计
- ✅ **答卷查看** - 查看单条答卷详细信息
- ✅ **数据导出** - 支持导出为 Excel 和 CSV 格式

### 技术特性
- 🌐 **Web与移动端兼容** - 响应式设计，完美适配各种屏幕尺寸
- 🔒 **安全可靠** - 数据验证、SQL注入防护
- 🎨 **美观易用** - 现代化界面设计

## 技术栈

- **后端**: PHP 7.4+
- **数据库**: MySQL 5.7+
- **前端**: 原生 HTML/CSS/JavaScript
- **图表库**: Chart.js
- **二维码生成**: qrcode.js

## 目录结构

```
wenjuan/
├── api/                    # 后端API
│   └── api.php            # 统一API入口
├── config/                # 配置文件
│   └── config.php         # 数据库和应用配置
├── includes/              # 核心类库
│   ├── Database.php       # 数据库操作类
│   └── helpers.php        # 辅助函数
├── assets/                # 静态资源
│   ├── css/               # 样式文件
│   │   ├── style.css      # 公共样式
│   │   ├── editor.css     # 编辑器样式
│   │   ├── view.css       # 填写页面样式
│   │   └── stats.css      # 统计页面样式
│   └── js/                # JavaScript文件
│       ├── app.js         # 主页逻辑
│       ├── editor.js      # 编辑器逻辑
│       ├── view.js        # 填写页面逻辑
│       ├── stats.js       # 统计页面逻辑
│       ├── qrcode.min.js  # 二维码库(需下载)
│       └── chart.min.js   # 图表库(需下载)
├── uploads/               # 上传文件目录
├── index.php              # 问卷列表首页
├── editor.php             # 问卷编辑器
├── view.php               # 问卷填写页面
├── stats.php              # 统计分析页面
└── database.sql           # 数据库初始化脚本
```

## 安装部署

### 1. 环境要求
- PHP 7.4 或更高版本
- MySQL 5.7 或更高版本
- Apache/Nginx 服务器
- 开启 PDO 扩展

### 2. 安装步骤

#### 步骤一：导入数据库
```bash
mysql -u root -p < database.sql
```
或使用phpMyAdmin导入 `database.sql` 文件。

#### 步骤二：配置数据库连接
编辑 `config/config.php` 文件，修改数据库连接信息：

```php
return [
    'db' => [
        'host' => '127.0.0.1',      // 数据库主机
        'port' => 3306,             // 端口
        'database' => 'wenjuan_system', // 数据库名
        'username' => 'root',       // 用户名
        'password' => '',           // 密码
        'charset' => 'utf8mb4',
    ],
    'app' => [
        'name' => '问卷系统',
        'url' => 'http://localhost/wenjuan', // 修改为你的域名/路径
        ...
    ],
];
```

#### 步骤三：下载第三方库

需要下载以下两个JS库并放到 `assets/js/` 目录：

1. **qrcode.min.js** - 二维码生成库
   - 下载地址: https://github.com/davidshimjs/qrcodejs/raw/master/qrcode.min.js
   - 保存为: `assets/js/qrcode.min.js`

2. **Chart.min.js** - 图表库
   - 下载地址: https://cdn.jsdelivr.net/npm/chart.js
   - 保存为: `assets/js/chart.min.js`

#### 步骤四：设置目录权限

确保 `uploads/` 目录可写：
```bash
chmod 777 uploads
```

## 使用说明

### 创建问卷

1. 访问 `index.php` 进入问卷列表
2. 点击「创建问卷」按钮
3. 在编辑器中：
   - 点击或拖拽左侧题型添加题目
   - 点击题目编辑属性
   - 支持拖拽排序题目
   - 支持复制、删除题目
4. 点击「保存」保存问卷

### 设置问卷

点击编辑器右上角「设置」按钮可设置：
- 截止时间
- 最大回收份数
- 是否限答一次
- 访问密码

### 发布问卷

1. 点击「发布」按钮
2. 复制链接或扫描二维码分享
3. 可随时点击「停止回收」关闭问卷

### 查看统计

1. 在问卷列表点击「统计」
2. 查看图表统计（饼图、柱状图）
3. 查看答卷列表
4. 点击「查看详情」查看单条答卷
5. 导出 Excel 或 CSV

## API 接口说明

所有接口统一使用 `api/api.php?action=xxx`

### 问卷管理
- `get_surveys` - 获取问卷列表
- `get_survey` - 获取问卷详情
- `create_survey` - 创建问卷
- `update_survey` - 更新问卷
- `delete_survey` - 删除问卷
- `save_questions` - 保存题目
- `save_conditions` - 保存条件规则
- `publish_survey` - 发布/取消发布

### 前端接口
- `get_public_survey` - 获取公开问卷
- `verify_password` - 验证访问密码
- `submit_response` - 提交答卷
- `upload_file` - 上传文件

### 统计接口
- `get_responses` - 获取答卷列表
- `get_response_detail` - 获取答卷详情
- `get_statistics` - 获取统计数据
- `export_excel` - 导出Excel
- `export_csv` - 导出CSV

## 常见问题

### Q: 上传文件失败？
A: 检查 `uploads/` 目录权限，确保PHP可写。

### Q: 数据库连接失败？
A: 检查 `config/config.php` 中的数据库配置，确保MySQL服务正常运行。

### Q: 二维码不显示？
A: 确认 `qrcode.min.js` 已正确放置在 `assets/js/` 目录。

### Q: 图表不显示？
A: 确认 `chart.min.js` 已正确放置在 `assets/js/` 目录。

## 安全建议

1. 修改数据库默认密码
2. 线上环境禁用PHP错误显示
3. 限制 `uploads/` 目录的PHP执行权限
4. 定期备份数据库

## License

MIT License
