<?php
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getInput() {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input === null) {
        $input = $_POST;
    }
    return $input;
}

function generateToken($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

function validateSurveyAccess($survey) {
    $config = require __DIR__ . '/../config/config.php';
    
    if ($survey['status'] != 1) {
        return ['success' => false, 'message' => '问卷未发布或已结束'];
    }
    
    if ($survey['end_time'] && strtotime($survey['end_time']) < time()) {
        return ['success' => false, 'message' => '问卷已超过截止时间'];
    }
    
    $db = Database::getInstance();
    $responseCount = $db->fetchOne(
        'SELECT COUNT(*) as count FROM responses WHERE survey_id = ?',
        [$survey['id']]
    );
    
    if ($survey['max_responses'] && $responseCount['count'] >= $survey['max_responses']) {
        return ['success' => false, 'message' => '问卷已达到最大回收份数'];
    }
    
    if ($survey['limit_once']) {
        $ip = $_SERVER['REMOTE_ADDR'];
        $existing = $db->fetchOne(
            'SELECT id FROM responses WHERE survey_id = ? AND ip_address = ?',
            [$survey['id'], $ip]
        );
        if ($existing) {
            return ['success' => false, 'message' => '您已提交过此问卷'];
        }
    }
    
    return ['success' => true];
}

function handleFileUpload($questionId) {
    $config = require __DIR__ . '/../config/config.php';
    $appConfig = $config['app'];
    
    if (!isset($_FILES['file'])) {
        return ['success' => false, 'message' => '没有上传文件'];
    }
    
    $file = $_FILES['file'];
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'message' => '文件上传错误'];
    }
    
    if ($file['size'] > $appConfig['max_file_size']) {
        return ['success' => false, 'message' => '文件大小超过限制'];
    }
    
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, $appConfig['allowed_file_types'])) {
        return ['success' => false, 'message' => '不支持的文件类型'];
    }
    
    $uploadDir = $appConfig['upload_dir'];
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $fileName = generateToken(16) . '.' . $extension;
    $filePath = $uploadDir . $fileName;
    
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        return [
            'success' => true,
            'file_name' => $file['name'],
            'file_path' => $fileName,
            'file_size' => $file['size'],
            'file_type' => $file['type']
        ];
    }
    
    return ['success' => false, 'message' => '文件保存失败'];
}
