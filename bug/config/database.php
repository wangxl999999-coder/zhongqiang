<?php
$db_path = __DIR__ . '/../bug_management.db';
$db = new SQLite3($db_path);

if (!$db) {
    die("数据库连接失败: " . $db->lastErrorMsg());
}

function init_database($db) {
    $db->exec("PRAGMA foreign_keys = ON;");

    $db->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        real_name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'developer', 'tester')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    $db->exec("CREATE TABLE IF NOT EXISTS bugs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        reproduce_steps TEXT,
        severity TEXT NOT NULL CHECK(severity IN ('critical', 'high', 'medium', 'low')),
        screenshot TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'verifying', 'closed')),
        version TEXT,
        module TEXT,
        discovery_phase TEXT,
        priority TEXT DEFAULT 'medium' CHECK(priority IN ('critical', 'high', 'medium', 'low')),
        creator_id INTEGER NOT NULL,
        assignee_id INTEGER,
        solution TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id),
        FOREIGN KEY (assignee_id) REFERENCES users(id)
    )");

    $db->exec("CREATE TABLE IF NOT EXISTS bug_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bug_id INTEGER NOT NULL,
        old_status TEXT,
        new_status TEXT,
        operator_id INTEGER NOT NULL,
        remark TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bug_id) REFERENCES bugs(id),
        FOREIGN KEY (operator_id) REFERENCES users(id)
    )");

    $result = $db->query("SELECT COUNT(*) as count FROM users");
    $row = $result->fetchArray();
    if ($row['count'] == 0) {
        $admin_password = password_hash('admin123', PASSWORD_DEFAULT);
        $dev_password = password_hash('dev123', PASSWORD_DEFAULT);
        $tester_password = password_hash('tester123', PASSWORD_DEFAULT);

        $stmt = $db->prepare("INSERT INTO users (username, password, real_name, role) VALUES (?, ?, ?, ?)");
        $stmt->bindValue(1, 'admin');
        $stmt->bindValue(2, $admin_password);
        $stmt->bindValue(3, '系统管理员');
        $stmt->bindValue(4, 'admin');
        $stmt->execute();

        $stmt = $db->prepare("INSERT INTO users (username, password, real_name, role) VALUES (?, ?, ?, ?)");
        $stmt->bindValue(1, 'developer');
        $stmt->bindValue(2, $dev_password);
        $stmt->bindValue(3, '开发工程师');
        $stmt->bindValue(4, 'developer');
        $stmt->execute();

        $stmt = $db->prepare("INSERT INTO users (username, password, real_name, role) VALUES (?, ?, ?, ?)");
        $stmt->bindValue(1, 'tester');
        $stmt->bindValue(2, $tester_password);
        $stmt->bindValue(3, '测试工程师');
        $stmt->bindValue(4, 'tester');
        $stmt->execute();
    }
}

init_database($db);
?>