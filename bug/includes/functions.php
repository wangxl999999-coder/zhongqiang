<?php
session_start();

function is_logged_in() {
    return isset($_SESSION['user_id']);
}

function require_login() {
    if (!is_logged_in()) {
        header('Location: /login.php');
        exit;
    }
}

function require_role($roles) {
    require_login();
    if (!in_array($_SESSION['user_role'], (array)$roles)) {
        die('权限不足');
    }
}

function get_current_user() {
    if (!is_logged_in()) {
        return null;
    }
    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'real_name' => $_SESSION['real_name'],
        'role' => $_SESSION['user_role']
    ];
}

function get_role_text($role) {
    $roles = [
        'admin' => '管理员',
        'developer' => '开发人员',
        'tester' => '测试人员'
    ];
    return $roles[$role] ?? $role;
}

function get_status_text($status) {
    $statuses = [
        'pending' => '待处理',
        'processing' => '处理中',
        'verifying' => '待验证',
        'closed' => '已关闭'
    ];
    return $statuses[$status] ?? $status;
}

function get_status_class($status) {
    $classes = [
        'pending' => 'warning',
        'processing' => 'primary',
        'verifying' => 'info',
        'closed' => 'success'
    ];
    return $classes[$status] ?? 'secondary';
}

function get_severity_text($severity) {
    $severities = [
        'critical' => '致命',
        'high' => '严重',
        'medium' => '一般',
        'low' => '轻微'
    ];
    return $severities[$severity] ?? $severity;
}

function get_severity_class($severity) {
    $classes = [
        'critical' => 'danger',
        'high' => 'warning',
        'medium' => 'primary',
        'low' => 'success'
    ];
    return $classes[$severity] ?? 'secondary';
}

function get_priority_text($priority) {
    $priorities = [
        'critical' => '紧急',
        'high' => '高',
        'medium' => '中',
        'low' => '低'
    ];
    return $priorities[$priority] ?? $priority;
}

function get_priority_class($priority) {
    $classes = [
        'critical' => 'danger',
        'high' => 'warning',
        'medium' => 'primary',
        'low' => 'success'
    ];
    return $classes[$priority] ?? 'secondary';
}

function format_date($datetime) {
    return date('Y-m-d H:i', strtotime($datetime));
}

function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function redirect($url) {
    header("Location: $url");
    exit;
}
?>