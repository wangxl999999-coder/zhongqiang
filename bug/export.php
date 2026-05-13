<?php
require_once 'config/database.php';
require_once 'includes/functions.php';

require_login();

$type = isset($_GET['type']) ? $_GET['type'] : '';

if ($type == 'csv') {
    $where = [];
    $params = [];

    if (!empty($_GET['status'])) {
        $where[] = "b.status = ?";
        $params[] = $_GET['status'];
    }

    if (!empty($_GET['severity'])) {
        $where[] = "b.severity = ?";
        $params[] = $_GET['severity'];
    }

    if (!empty($_GET['priority'])) {
        $where[] = "b.priority = ?";
        $params[] = $_GET['priority'];
    }

    if (!empty($_GET['assignee'])) {
        if ($_GET['assignee'] == 'unassigned') {
            $where[] = "b.assignee_id IS NULL";
        } elseif ($_GET['assignee'] == 'me') {
            $where[] = "b.assignee_id = ?";
            $params[] = $_SESSION['user_id'];
        } else {
            $where[] = "b.assignee_id = ?";
            $params[] = intval($_GET['assignee']);
        }
    }

    if (!empty($_GET['module'])) {
        $where[] = "b.module = ?";
        $params[] = $_GET['module'];
    }

    if (!empty($_GET['search'])) {
        $where[] = "b.title LIKE ?";
        $params[] = '%' . $_GET['search'] . '%';
    }

    $where_sql = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

    $sql = "SELECT b.*, 
                   c.real_name as creator_name, 
                   a.real_name as assignee_name
            FROM bugs b
            LEFT JOIN users c ON b.creator_id = c.id
            LEFT JOIN users a ON b.assignee_id = a.id
            $where_sql
            ORDER BY b.created_at DESC";

    $stmt = $db->prepare($sql);
    foreach ($params as $i => $param) {
        $stmt->bindValue($i + 1, $param);
    }
    $result = $stmt->execute();

    $filename = 'bugs_export_' . date('YmdHis') . '.csv';
    
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    
    $output = fopen('php://output', 'w');
    
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    
    fputcsv($output, [
        'ID',
        '标题',
        '状态',
        '严重程度',
        '优先级',
        '模块',
        '创建人',
        '指派人',
        '版本号',
        '发现阶段',
        '创建时间',
        '更新时间'
    ]);
    
    while ($row = $result->fetchArray()) {
        fputcsv($output, [
            $row['id'],
            $row['title'],
            get_status_text($row['status']),
            get_severity_text($row['severity']),
            get_priority_text($row['priority']),
            $row['module'] ?: '-',
            $row['creator_name'],
            $row['assignee_name'] ?: '未分配',
            $row['version'] ?: '-',
            $row['discovery_phase'] ?: '-',
            $row['created_at'],
            $row['updated_at']
        ]);
    }
    
    fclose($output);
    exit;
} elseif ($type == 'pdf' && isset($_GET['id'])) {
    $bug_id = intval($_GET['id']);
    
    $stmt = $db->prepare("SELECT b.*, 
                                 c.real_name as creator_name, 
                                 a.real_name as assignee_name
                          FROM bugs b
                          LEFT JOIN users c ON b.creator_id = c.id
                          LEFT JOIN users a ON b.assignee_id = a.id
                          WHERE b.id = ?");
    $stmt->bindValue(1, $bug_id);
    $result = $stmt->execute();
    $bug = $result->fetchArray();
    
    if (!$bug) {
        die('BUG不存在');
    }
    
    $stmt = $db->prepare("SELECT h.*, u.real_name as operator_name 
                          FROM bug_history h
                          LEFT JOIN users u ON h.operator_id = u.id
                          WHERE h.bug_id = ?
                          ORDER BY h.created_at DESC");
    $stmt->bindValue(1, $bug_id);
    $history_result = $stmt->execute();
    $history = [];
    while ($row = $history_result->fetchArray()) {
        $history[] = $row;
    }
    
    $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>BUG #' . $bug['id'] . ' - ' . $bug['title'] . '</title>
    <style>
        body { font-family: "Microsoft YaHei", sans-serif; padding: 20px; }
        h1 { color: #0d6efd; border-bottom: 2px solid #0d6efd; padding-bottom: 10px; }
        .section { margin: 20px 0; }
        .section h2 { color: #495057; font-size: 18px; margin-bottom: 10px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table td { padding: 8px 12px; border: 1px solid #dee2e6; }
        .info-table td:first-child { background-color: #f8f9fa; width: 120px; font-weight: bold; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; font-size: 12px; }
        .badge-pending { background-color: #ffc107; }
        .badge-processing { background-color: #0d6efd; }
        .badge-verifying { background-color: #0dcaf0; }
        .badge-closed { background-color: #198754; }
        .badge-critical { background-color: #dc3545; }
        .badge-high { background-color: #ffc107; }
        .badge-medium { background-color: #0d6efd; }
        .badge-low { background-color: #198754; }
        .history-item { margin: 10px 0; padding: 10px; background-color: #f8f9fa; border-radius: 4px; }
        .history-meta { color: #6c757d; font-size: 12px; margin-bottom: 5px; }
        .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px; text-align: center; }
    </style>
</head>
<body>
    <h1>BUG #' . $bug['id'] . ' - ' . $bug['title'] . '</h1>
    
    <div class="section">
        <h2>基本信息</h2>
        <table class="info-table">
            <tr>
                <td>状态</td>
                <td><span class="badge badge-' . $bug['status'] . '">' . get_status_text($bug['status']) . '</span></td>
            </tr>
            <tr>
                <td>严重程度</td>
                <td><span class="badge badge-' . $bug['severity'] . '">' . get_severity_text($bug['severity']) . '</span></td>
            </tr>
            <tr>
                <td>优先级</td>
                <td><span class="badge badge-' . $bug['priority'] . '">' . get_priority_text($bug['priority']) . '</span></td>
            </tr>
            <tr>
                <td>创建人</td>
                <td>' . $bug['creator_name'] . '</td>
            </tr>
            <tr>
                <td>指派人</td>
                <td>' . ($bug['assignee_name'] ?: '未分配') . '</td>
            </tr>
            <tr>
                <td>模块</td>
                <td>' . ($bug['module'] ?: '-') . '</td>
            </tr>
            <tr>
                <td>版本号</td>
                <td>' . ($bug['version'] ?: '-') . '</td>
            </tr>
            <tr>
                <td>发现阶段</td>
                <td>' . ($bug['discovery_phase'] ?: '-') . '</td>
            </tr>
            <tr>
                <td>创建时间</td>
                <td>' . $bug['created_at'] . '</td>
            </tr>
            <tr>
                <td>更新时间</td>
                <td>' . $bug['updated_at'] . '</td>
            </tr>
        </table>
    </div>
    
    <div class="section">
        <h2>详细描述</h2>
        <div style="padding: 10px; background-color: #f8f9fa; border-radius: 4px; white-space: pre-wrap;">' . htmlspecialchars($bug['description']) . '</div>
    </div>';
    
    if ($bug['reproduce_steps']) {
        $html .= '<div class="section">
        <h2>重现步骤</h2>
        <div style="padding: 10px; background-color: #f8f9fa; border-radius: 4px; white-space: pre-wrap;">' . htmlspecialchars($bug['reproduce_steps']) . '</div>
    </div>';
    }
    
    if ($bug['solution']) {
        $html .= '<div class="section">
        <h2>解决方案</h2>
        <div style="padding: 10px; background-color: #d1e7dd; border-radius: 4px; white-space: pre-wrap;">' . htmlspecialchars($bug['solution']) . '</div>
    </div>';
    }
    
    if (!empty($history)) {
        $html .= '<div class="section">
        <h2>操作历史</h2>';
        foreach ($history as $item) {
            $html .= '<div class="history-item">
            <div class="history-meta">
                <strong>' . $item['operator_name'] . '</strong> - ' . $item['created_at'];
            if ($item['old_status']) {
                $html .= ' &nbsp; ' . get_status_text($item['old_status']) . ' → ' . get_status_text($item['new_status']);
            }
            $html .= '</div>';
            if ($item['remark']) {
                $html .= '<div>' . htmlspecialchars($item['remark']) . '</div>';
            }
            $html .= '</div>';
        }
        $html .= '</div>';
    }
    
    $html .= '<div class="footer">
        BUG管理系统 - 导出时间: ' . date('Y-m-d H:i:s') . '
    </div>
</body>
</html>';
    
    $filename = 'bug_' . $bug_id . '_' . date('YmdHis') . '.html';
    header('Content-Type: text/html; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    echo $html;
    exit;
} else {
    redirect('index.php');
}
?>