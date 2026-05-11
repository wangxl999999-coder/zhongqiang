<?php
require_once __DIR__ . '/includes/Database.php';

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    echo "<h2>更新验证码表结构</h2>";
    
    $stmt = $pdo->query("SHOW COLUMNS FROM password_reset_codes");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
    $columns = array_map('strtolower', $columns);
    
    if (!in_array('type', $columns)) {
        echo "<p>正在添加 type 字段...</p>";
        $pdo->exec("ALTER TABLE password_reset_codes ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'reset' COMMENT '类型：register注册 reset找回密码'");
        $pdo->exec("ALTER TABLE password_reset_codes ADD INDEX idx_type (type)");
        $pdo->exec("ALTER TABLE password_reset_codes ADD INDEX idx_phone_type (phone, type)");
        echo "<div style='color: green;'>✓ type 字段添加成功</div>";
    } else {
        echo "<div style='color: green;'>✓ type 字段已存在</div>";
    }
    
    echo "<p style='color: #666; margin-top: 20px;'>更新完成！请删除此文件。</p>";
    
} catch (Exception $e) {
    echo "<div style='color: red;'>错误: " . $e->getMessage() . "</div>";
}
