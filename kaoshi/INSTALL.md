# 在线考试系统 - 安装指南

## 问题修复说明

本次修复了以下问题：
- ✅ 缺少 `config/cache.php` 缓存配置文件导致 "Unable to resolve NULL driver for [think\Cache]" 错误
- ✅ 缺少 `config/session.php` Session配置文件
- ✅ 缺少 `config/view.php` 视图配置文件
- ✅ 入口文件 `public/index.php` 缺少 `$app->initialize()` 调用
- ✅ 缺少路由配置文件 `route/app.php`
- ✅ 缺少 `.htaccess` URL重写配置
- ✅ 添加了 Nginx 配置示例

## 系统要求

- PHP >= 7.1.0
- MySQL >= 5.6
- Apache / Nginx
- Composer

## 详细安装步骤

### 第一步：安装 Composer 依赖

在项目根目录下执行：

```bash
cd d:\my\zhongqiang\kaoshi
composer install
```

如果国内访问较慢，可以使用阿里云镜像：
```bash
composer config -g repo.packagist composer https://mirrors.aliyun.com/composer/
composer install
```

### 第二步：创建数据库

1. 打开 MySQL 客户端（如 phpMyAdmin 或 Navicat）
2. 创建新数据库，命名为 `kaoshi`
3. 字符集选择 `utf8mb4`，排序规则选择 `utf8mb4_unicode_ci`

### 第三步：导入数据库结构

导入 `database/install.sql` 文件到刚刚创建的数据库中。

使用命令行导入：
```bash
mysql -u root -p kaoshi < database/install.sql
```

### 第四步：配置数据库连接

编辑 `config/database.php` 文件，修改数据库配置：

```php
return [
    'default' => 'mysql',
    'connections' => [
        'mysql' => [
            'type' => 'mysql',
            'hostname' => '127.0.0.1',    // 数据库地址
            'database' => 'kaoshi',        // 数据库名
            'username' => 'root',          // 数据库用户名
            'password' => '',              // 数据库密码
            'hostport' => '3306',          // 端口
            'charset' => 'utf8mb4',
            'prefix' => 'ks_',             // 表前缀
            'debug' => true,
        ],
    ],
];
```

或者编辑 `.env` 文件：
```env
[DATABASE]
TYPE = mysql
HOSTNAME = 127.0.0.1
DATABASE = kaoshi
USERNAME = root
PASSWORD = 你的密码
HOSTPORT = 3306
CHARSET = utf8mb4
PREFIX = ks_
```

### 第五步：配置Web服务器

#### 方式一：使用 PHP 内置服务器（开发测试用）

```bash
cd public
php -S localhost:8000
```

然后访问：http://localhost:8000

#### 方式二：使用 Apache

确保已启用 `mod_rewrite` 模块，网站根目录指向 `public` 目录。

#### 方式三：使用 Nginx

参考 `nginx.conf.example` 配置文件进行配置。

### 第六步：设置目录权限

确保以下目录可写：
- `runtime/`
- `public/uploads/`

Windows 系统一般不需要特别设置。

### 第七步：访问系统

默认管理员账号：
- 用户名：admin
- 密码：admin

## 配置文件清单

已创建的配置文件：
- `config/app.php` - 应用配置
- `config/database.php` - 数据库配置
- `config/cache.php` - 缓存配置 ✅ 新增
- `config/session.php` - Session配置 ✅ 新增
- `config/view.php` - 视图配置 ✅ 新增
- `route/app.php` - 路由配置 ✅ 新增

## 常见问题

### 1. 提示 "Unable to resolve NULL driver for [think\Cache]"

**原因**：缺少缓存配置文件

**解决**：已修复，确保 `config/cache.php` 文件存在

### 2. 模板无法渲染

**原因**：缺少视图配置或模板引擎未正确加载

**解决**：已修复，确保 `config/view.php` 文件存在

### 3. URL 访问 404

**原因**：URL重写未配置

**解决**：确保 `public/.htaccess` 文件存在，并且Apache已启用mod_rewrite

### 4. Session 无法正常工作

**原因**：缺少Session配置

**解决**：已修复，确保 `config/session.php` 文件存在

### 5. Composer 安装失败

**原因**：网络问题或PHP版本不兼容

**解决**：
- 使用国内镜像源
- 检查PHP版本是否 >= 7.1
- 检查PHP扩展是否已安装（pdo, mbstring, json, curl）

## 运行环境检查

可以运行 `test.php` 文件检查环境：
```bash
php test.php
```

## 项目结构

```
kaoshi/
├── app/                    # 应用目录
│   ├── admin/             # 管理员端
│   ├── teacher/           # 教师端（待开发）
│   ├── student/           # 学生端（待开发）
│   └── common/model/      # 公共模型
├── config/                # 配置文件目录
├── route/                 # 路由配置
├── database/              # 数据库文件
├── public/                # 网站根目录
│   ├── static/            # 静态资源
│   ├── uploads/           # 上传目录
│   ├── .htaccess          # URL重写
│   └── index.php          # 入口文件
├── runtime/               # 运行时目录
├── vendor/                # Composer依赖（需安装）
└── README.md             # 项目说明
```

## 技术支持

如遇其他问题，请检查：
1. PHP错误日志
2. runtime/log/ 目录下的日志文件
3. 浏览器控制台错误信息
