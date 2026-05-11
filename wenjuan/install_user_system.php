<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$config = require __DIR__ . '/config/config.php';

try {
    $pdo = new PDO(
        "mysql:host={$config['db']['host']};port={$config['db']['port']};dbname={$config['db']['database']};charset=utf8mb4",
        $config['db']['username'],
        $config['db']['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    echo "<h1>问卷系统用户功能安装</h1>";
    echo "<style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { color: #2563eb; }
        h2 { color: #1e40af; margin-top: 30px; }
        .success { color: #059669; background: #d1fae5; padding: 10px; border-radius: 6px; margin: 10px 0; }
        .error { color: #dc2626; background: #fee2e2; padding: 10px; border-radius: 6px; margin: 10px 0; }
        .info { color: #2563eb; background: #dbeafe; padding: 10px; border-radius: 6px; margin: 10px 0; }
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 90%; }
        pre { background: #1f2937; color: #e5e7eb; padding: 15px; border-radius: 8px; overflow-x: auto; }
    </style>";
    
    $pdo->beginTransaction();
    
    $steps = [];
    
    echo "<h2>1. 检查并更新 users 表</h2>";
    
    $stmt = $pdo->query("SHOW COLUMNS FROM users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
    $columns = array_map('strtolower', $columns);
    
    $addColumns = [
        'phone' => "ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL COMMENT '手机号'",
        'wechat_openid' => "ALTER TABLE users ADD COLUMN wechat_openid VARCHAR(64) DEFAULT NULL COMMENT '微信OpenID'",
        'wechat_unionid' => "ALTER TABLE users ADD COLUMN wechat_unionid VARCHAR(64) DEFAULT NULL COMMENT '微信UnionID'",
        'nickname' => "ALTER TABLE users ADD COLUMN nickname VARCHAR(50) DEFAULT NULL COMMENT '昵称'",
        'avatar' => "ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL COMMENT '头像路径'",
        'bio' => "ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL COMMENT '个人简介'",
        'status' => "ALTER TABLE users ADD COLUMN status TINYINT DEFAULT 1 COMMENT '状态：1正常 0禁用'",
        'reset_token' => "ALTER TABLE users ADD COLUMN reset_token VARCHAR(64) DEFAULT NULL COMMENT '重置密码Token'",
        'reset_expires' => "ALTER TABLE users ADD COLUMN reset_expires INT DEFAULT NULL COMMENT '重置密码过期时间'",
    ];
    
    foreach ($addColumns as $col => $sql) {
        if (!in_array($col, $columns)) {
            try {
                $pdo->exec($sql);
                $steps[] = "✓ 添加字段: $col";
                echo "<div class='success'>✓ 添加字段: <code>$col</code></div>";
            } catch (PDOException $e) {
                echo "<div class='error'>✗ 添加字段 $col 失败: " . $e->getMessage() . "</div>";
            }
        } else {
            echo "<div class='info'>✓ 字段 <code>$col</code> 已存在</div>";
        }
    }
    
    $indexCheck = $pdo->query("SHOW INDEX FROM users WHERE Key_name = 'idx_phone'");
    if (!$indexCheck->fetch()) {
        try {
            $pdo->exec("ALTER TABLE users ADD UNIQUE INDEX idx_phone (phone)");
            $steps[] = "✓ 添加索引: idx_phone";
            echo "<div class='success'>✓ 添加唯一索引: <code>idx_phone</code></div>";
        } catch (PDOException $e) {
            echo "<div class='error'>✗ 添加索引失败: " . $e->getMessage() . "</div>";
        }
    } else {
        echo "<div class='info'>✓ 索引 <code>idx_phone</code> 已存在</div>";
    }
    
    $indexCheck = $pdo->query("SHOW INDEX FROM users WHERE Key_name = 'idx_wechat_openid'");
    if (!$indexCheck->fetch()) {
        try {
            $pdo->exec("ALTER TABLE users ADD INDEX idx_wechat_openid (wechat_openid)");
            $steps[] = "✓ 添加索引: idx_wechat_openid";
            echo "<div class='success'>✓ 添加索引: <code>idx_wechat_openid</code></div>";
        } catch (PDOException $e) {
            echo "<div class='error'>✗ 添加索引失败: " . $e->getMessage() . "</div>";
        }
    } else {
        echo "<div class='info'>✓ 索引 <code>idx_wechat_openid</code> 已存在</div>";
    }
    
    echo "<h2>2. 检查并更新 surveys 表</h2>";
    
    $stmt = $pdo->query("SHOW COLUMNS FROM surveys");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
    $columns = array_map('strtolower', $columns);
    
    if (!in_array('user_id', $columns)) {
        try {
            $pdo->exec("ALTER TABLE surveys ADD COLUMN user_id INT DEFAULT NULL COMMENT '创建用户ID'");
            $steps[] = "✓ 添加字段: surveys.user_id";
            echo "<div class='success'>✓ 添加字段: <code>surveys.user_id</code></div>";
        } catch (PDOException $e) {
            echo "<div class='error'>✗ 添加字段失败: " . $e->getMessage() . "</div>";
        }
    } else {
        echo "<div class='info'>✓ 字段 <code>user_id</code> 已存在</div>";
    }
    
    $indexCheck = $pdo->query("SHOW INDEX FROM surveys WHERE Key_name = 'idx_user_id'");
    if (!$indexCheck->fetch()) {
        try {
            $pdo->exec("ALTER TABLE surveys ADD INDEX idx_user_id (user_id)");
            $steps[] = "✓ 添加索引: surveys.idx_user_id";
            echo "<div class='success'>✓ 添加索引: <code>surveys.idx_user_id</code></div>";
        } catch (PDOException $e) {
            echo "<div class='error'>✗ 添加索引失败: " . $e->getMessage() . "</div>";
        }
    } else {
        echo "<div class='info'>✓ 索引 <code>surveys.idx_user_id</code> 已存在</div>";
    }
    
    echo "<h2>3. 创建 user_sessions 表</h2>";
    
    $stmt = $pdo->query("SHOW TABLES LIKE 'user_sessions'");
    if (!$stmt->fetch()) {
        try {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL COMMENT '用户ID',
                    token VARCHAR(128) NOT NULL COMMENT '会话Token',
                    user_agent VARCHAR(255) DEFAULT NULL COMMENT '用户代理',
                    ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
                    expires_at INT NOT NULL COMMENT '过期时间',
                    created_at INT NOT NULL COMMENT '创建时间',
                    INDEX idx_token (token),
                    INDEX idx_user_id (user_id),
                    INDEX idx_expires_at (expires_at),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户会话表'
            ");
            $steps[] = "✓ 创建表: user_sessions";
            echo "<div class='success'>✓ 创建表: <code>user_sessions</code></div>";
        } catch (PDOException $e) {
            echo "<div class='error'>✗ 创建表失败: " . $e->getMessage() . "</div>";
        }
    } else {
        echo "<div class='info'>✓ 表 <code>user_sessions</code> 已存在</div>";
    }
    
    echo "<h2>4. 创建 survey_collaborators 表</h2>";
    
    $stmt = $pdo->query("SHOW TABLES LIKE 'survey_collaborators'");
    if (!$stmt->fetch()) {
        try {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS survey_collaborators (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    survey_id INT NOT NULL COMMENT '问卷ID',
                    user_id INT NOT NULL COMMENT '协作用户ID',
                    role VARCHAR(20) NOT NULL DEFAULT 'editor' COMMENT '角色：owner所有者 editor编辑者 viewer查看者',
                    permission_level TINYINT NOT NULL DEFAULT 2 COMMENT '权限级别：3管理 2编辑 1查看',
                    can_edit_questions TINYINT DEFAULT 1 COMMENT '能否编辑题目',
                    can_edit_settings TINYINT DEFAULT 0 COMMENT '能否编辑设置',
                    can_view_responses TINYINT DEFAULT 1 COMMENT '能否查看回复',
                    can_export_responses TINYINT DEFAULT 0 COMMENT '能否导出回复',
                    created_at INT NOT NULL COMMENT '创建时间',
                    UNIQUE KEY unique_survey_user (survey_id, user_id),
                    INDEX idx_survey_id (survey_id),
                    INDEX idx_user_id (user_id),
                    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='问卷协作成员表'
            ");
            $steps[] = "✓ 创建表: survey_collaborators";
            echo "<div class='success'>✓ 创建表: <code>survey_collaborators</code></div>";
        } catch (PDOException $e) {
            echo "<div class='error'>✗ 创建表失败: " . $e->getMessage() . "</div>";
        }
    } else {
        echo "<div class='info'>✓ 表 <code>survey_collaborators</code> 已存在</div>";
    }
    
    echo "<h2>5. 创建重置密码验证码表</h2>";
    
    $stmt = $pdo->query("SHOW TABLES LIKE 'password_reset_codes'");
    if (!$stmt->fetch()) {
        try {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS password_reset_codes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL COMMENT '用户ID',
                    phone VARCHAR(20) NOT NULL COMMENT '手机号',
                    code VARCHAR(6) NOT NULL COMMENT '验证码',
                    expires_at INT NOT NULL COMMENT '过期时间',
                    used TINYINT DEFAULT 0 COMMENT '是否已使用',
                    created_at INT NOT NULL COMMENT '创建时间',
                    INDEX idx_phone (phone),
                    INDEX idx_code (code),
                    INDEX idx_expires_at (expires_at),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='密码重置验证码表'
            ");
            $steps[] = "✓ 创建表: password_reset_codes";
            echo "<div class='success'>✓ 创建表: <code>password_reset_codes</code></div>";
        } catch (PDOException $e) {
            echo "<div class='error'>✗ 创建表失败: " . $e->getMessage() . "</div>";
        }
    } else {
        echo "<div class='info'>✓ 表 <code>password_reset_codes</code> 已存在</div>";
    }
    
    echo "<h2>6. 创建微信登录临时表</h2>";
    
    $stmt = $pdo->query("SHOW TABLES LIKE 'wechat_login_scenes'");
    if (!$stmt->fetch()) {
        try {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS wechat_login_scenes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    scene_id VARCHAR(64) NOT NULL COMMENT '场景ID',
                    user_id INT DEFAULT NULL COMMENT '关联用户ID（扫描后）',
                    status VARCHAR(20) NOT NULL DEFAULT 'waiting' COMMENT '状态：waiting等待 scanned已扫描 confirmed已确认 expired已过期',
                    expires_at INT NOT NULL COMMENT '过期时间',
                    created_at INT NOT NULL COMMENT '创建时间',
                    UNIQUE KEY idx_scene_id (scene_id),
                    INDEX idx_status (status),
                    INDEX idx_expires_at (expires_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信扫码登录场景表'
            ");
            $steps[] = "✓ 创建表: wechat_login_scenes";
            echo "<div class='success'>✓ 创建表: <code>wechat_login_scenes</code></div>";
        } catch (PDOException $e) {
            echo "<div class='error'>✗ 创建表失败: " . $e->getMessage() . "</div>";
        }
    } else {
        echo "<div class='info'>✓ 表 <code>wechat_login_scenes</code> 已存在</div>";
    }
    
    $pdo->commit();
    
    echo "<h2>✅ 安装完成</h2>";
    echo "<div class='success'>";
    echo "<p><strong>用户系统已成功安装！</strong></p>";
    echo "<ul>";
    foreach ($steps as $step) {
        echo "<li>$step</li>";
    }
    echo "</ul>";
    echo "</div>";
    
    echo "<h2>📋 功能说明</h2>";
    echo "<div class='info'>";
    echo "<p><strong>新增功能：</strong></p>";
    echo "<ul>";
    echo "<li>✅ 用户注册登录（手机号密码）</li>";
    echo "<li>✅ 微信扫码登录（需配置微信开发者账号）</li>";
    echo "<li>✅ 找回密码（短信验证码）</li>";
    echo "<li>✅ 用户头像和昵称设置</li>";
    echo "<li>✅ 用户与问卷关联</li>";
    echo "<li>✅ 团队协作功能（多人编辑同一问卷）</li>";
    echo "<li>✅ 权限级别控制（查看/编辑/管理）</li>";
    echo "<li>✅ 修复发布地址URL问题</li>";
    echo "</ul>";
    echo "</div>";
    
    echo "<div class='info'>";
    echo "<p><strong>访问入口：</strong></p>";
    echo "<ul>";
    echo "<li>登录/注册页面：<code>login.php</code></li>";
    echo "<li>首页：<code>index.php</code></li>";
    echo "</ul>";
    echo "</div>";
    
    echo "<p style='color: #dc2626; margin-top: 30px;'>⚠️ <strong>安全提示：</strong>安装完成后，请删除此文件 <code>install_user_system.php</code></p>";
    
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "<div class='error'>";
    echo "<strong>数据库错误：</strong> " . $e->getMessage();
    echo "</div>";
    echo "<pre>";
    echo $e->getTraceAsString();
    echo "</pre>";
}
