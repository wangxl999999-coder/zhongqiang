<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/helpers.php';

$db = Database::getInstance();
$config = require __DIR__ . '/../config/config.php';

ensurePasswordResetCodesTable($db);

$action = $_GET['action'] ?? '';

function getCurrentUser($db) {
    $headers = getallheaders();
    $token = null;
    
    if (isset($headers['Authorization'])) {
        $token = str_replace('Bearer ', '', $headers['Authorization']);
    } elseif (isset($_GET['token'])) {
        $token = $_GET['token'];
    } elseif (isset($_POST['token'])) {
        $token = $_POST['token'];
    }
    
    if (!$token) {
        return null;
    }
    
    $session = $db->fetchOne(
        'SELECT s.*, u.* FROM user_sessions s 
         LEFT JOIN users u ON s.user_id = u.id 
         WHERE s.session_token = ? AND s.expires_at > NOW()',
        [$token]
    );
    
    if (!$session) {
        return null;
    }
    
    return $session;
}

function createUserSession($db, $userId, $config) {
    $token = generateToken(32);
    $expireDays = $config['session']['expire_days'] ?? 30;
    $expiresAt = date('Y-m-d H:i:s', time() + $expireDays * 24 * 60 * 60);
    
    $db->insert('user_sessions', [
        'user_id' => $userId,
        'session_token' => $token,
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
        'expires_at' => $expiresAt,
    ]);
    
    return [
        'token' => $token,
        'expires_at' => $expiresAt
    ];
}

function sanitizePhone($phone) {
    return preg_replace('/[^0-9]/', '', $phone);
}

function validatePhone($phone) {
    return preg_match('/^1[3-9]\d{9}$/', $phone);
}

function validatePassword($password) {
    return strlen($password) >= 6;
}

function getUserSafeData($user) {
    unset($user['password']);
    unset($user['reset_token']);
    unset($user['reset_token_expire']);
    if (!empty($user['avatar'])) {
        $config = require __DIR__ . '/../config/config.php';
        if (strpos($user['avatar'], 'http') !== 0) {
            $user['avatar_url'] = $config['app']['url'] . $config['app']['avatar_url'] . $user['avatar'];
        } else {
            $user['avatar_url'] = $user['avatar'];
        }
    } else {
        $user['avatar_url'] = null;
    }
    return $user;
}

function ensurePasswordResetCodesTable($db) {
    static $checked = false;
    
    if ($checked) {
        return;
    }
    
    $checked = true;
    
    $pdo = $db->getConnection();
    
    try {
        $stmt = $pdo->query("SHOW TABLES LIKE 'password_reset_codes'");
        if (!$stmt->fetch()) {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS password_reset_codes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT DEFAULT 0 COMMENT '用户ID（注册时为0）',
                    phone VARCHAR(20) NOT NULL COMMENT '手机号',
                    code VARCHAR(6) NOT NULL COMMENT '验证码',
                    type VARCHAR(20) NOT NULL DEFAULT 'reset' COMMENT '类型：register注册 reset找回密码',
                    expires_at INT NOT NULL COMMENT '过期时间（Unix时间戳）',
                    used TINYINT DEFAULT 0 COMMENT '是否已使用',
                    created_at INT NOT NULL COMMENT '创建时间（Unix时间戳）',
                    INDEX idx_phone (phone),
                    INDEX idx_code (code),
                    INDEX idx_type (type),
                    INDEX idx_expires_at (expires_at),
                    INDEX idx_phone_type (phone, type)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='短信验证码表'
            ");
        } else {
            $stmt = $pdo->query("SHOW COLUMNS FROM password_reset_codes");
            $columns = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
            $columns = array_map('strtolower', $columns);
            
            if (!in_array('type', $columns)) {
                $pdo->exec("ALTER TABLE password_reset_codes ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'reset' COMMENT '类型：register注册 reset找回密码'");
                $pdo->exec("ALTER TABLE password_reset_codes ADD INDEX idx_type (type)");
                $pdo->exec("ALTER TABLE password_reset_codes ADD INDEX idx_phone_type (phone, type)");
            }
        }
    } catch (Exception $e) {
        error_log('Error ensuring password_reset_codes table: ' . $e->getMessage());
    }
}

switch ($action) {
    case 'register':
        registerUser($db, $config);
        break;
    case 'login':
        loginUser($db, $config);
        break;
    case 'wechat_login':
        wechatLogin($db, $config);
        break;
    case 'wechat_qr':
        generateWechatQR($db, $config);
        break;
    case 'wechat_check':
        checkWechatLogin($db);
        break;
    case 'logout':
        logoutUser($db);
        break;
    case 'get_user':
        getUserInfo($db);
        break;
    case 'update_profile':
        updateUserProfile($db);
        break;
    case 'update_avatar':
        updateUserAvatar($db, $config);
        break;
    case 'update_password':
        updateUserPassword($db);
        break;
    case 'reset_password':
        resetPassword($db, $config);
        break;
    case 'send_reset_code':
        sendResetCode($db, $config);
        break;
    case 'send_register_code':
        sendRegisterCode($db, $config);
        break;
    case 'verify_code':
        verifyCode($db);
        break;
    case 'verify_reset_code':
        verifyResetCode($db);
        break;
    default:
        jsonResponse(['success' => false, 'message' => '未知操作']);
}

function registerUser($db, $config) {
    $input = getInput();
    $phone = sanitizePhone($input['phone'] ?? '');
    $password = $input['password'] ?? '';
    $nickname = $input['nickname'] ?? '';
    $code = $input['code'] ?? '';
    
    if (empty($phone) || !validatePhone($phone)) {
        jsonResponse(['success' => false, 'message' => '请输入正确的手机号']);
    }
    
    if (empty($password) || !validatePassword($password)) {
        jsonResponse(['success' => false, 'message' => '密码长度至少6位']);
    }
    
    if (empty($code)) {
        jsonResponse(['success' => false, 'message' => '请输入验证码']);
    }
    
    $existing = $db->fetchOne('SELECT id FROM users WHERE phone = ?', [$phone]);
    if ($existing) {
        jsonResponse(['success' => false, 'message' => '该手机号已注册']);
    }
    
    if (!verifySmsCode($db, $phone, $code, 'register')) {
        jsonResponse(['success' => false, 'message' => '验证码错误或已过期']);
    }
    
    $userId = $db->insert('users', [
        'phone' => $phone,
        'username' => 'u_' . $phone,
        'password' => password_hash($password, PASSWORD_DEFAULT),
        'nickname' => !empty($nickname) ? sanitizeInput($nickname) : '用户' . substr($phone, -4),
    ]);
    
    $session = createUserSession($db, $userId, $config);
    
    $user = $db->fetchOne('SELECT * FROM users WHERE id = ?', [$userId]);
    
    jsonResponse([
        'success' => true,
        'data' => [
            'user' => getUserSafeData($user),
            'token' => $session['token'],
            'expires_at' => $session['expires_at']
        ]
    ]);
}

function loginUser($db, $config) {
    $input = getInput();
    $account = sanitizeInput($input['account'] ?? '');
    $password = $input['password'] ?? '';
    
    if (empty($account)) {
        jsonResponse(['success' => false, 'message' => '请输入手机号或用户名']);
    }
    
    if (empty($password)) {
        jsonResponse(['success' => false, 'message' => '请输入密码']);
    }
    
    $user = $db->fetchOne(
        'SELECT * FROM users WHERE phone = ? OR username = ? OR email = ?',
        [$account, $account, $account]
    );
    
    if (!$user) {
        jsonResponse(['success' => false, 'message' => '账号或密码错误']);
    }
    
    if (!password_verify($password, $user['password'])) {
        jsonResponse(['success' => false, 'message' => '账号或密码错误']);
    }
    
    $db->update('users', [
        'last_login_at' => date('Y-m-d H:i:s'),
        'last_login_ip' => $_SERVER['REMOTE_ADDR'] ?? ''
    ], 'id = :id', ['id' => $user['id']]);
    
    $session = createUserSession($db, $user['id'], $config);
    
    jsonResponse([
        'success' => true,
        'data' => [
            'user' => getUserSafeData($user),
            'token' => $session['token'],
            'expires_at' => $session['expires_at']
        ]
    ]);
}

function wechatLogin($db, $config) {
    $input = getInput();
    $code = $input['code'] ?? '';
    
    if (empty($code)) {
        jsonResponse(['success' => false, 'message' => '缺少微信授权码']);
    }
    
    $wechatConfig = $config['wechat'] ?? [];
    $appId = $wechatConfig['app_id'] ?? '';
    $appSecret = $wechatConfig['app_secret'] ?? '';
    
    if (empty($appId) || empty($appSecret)) {
        $openId = 'mock_wechat_' . md5($code);
        $unionId = null;
    } else {
        $url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid={$appId}&secret={$appSecret}&code={$code}&grant_type=authorization_code";
        $response = @file_get_contents($url);
        $data = json_decode($response, true);
        
        if (!$data || isset($data['errcode'])) {
            jsonResponse(['success' => false, 'message' => '微信登录失败']);
        }
        
        $openId = $data['openid'];
        $unionId = $data['unionid'] ?? null;
    }
    
    $user = $db->fetchOne('SELECT * FROM users WHERE wechat_openid = ?', [$openId]);
    
    if (!$user) {
        $userId = $db->insert('users', [
            'wechat_openid' => $openId,
            'wechat_unionid' => $unionId,
            'username' => 'wx_' . substr($openId, -8),
            'nickname' => '微信用户',
            'password' => password_hash(generateToken(16), PASSWORD_DEFAULT),
        ]);
        $user = $db->fetchOne('SELECT * FROM users WHERE id = ?', [$userId]);
    }
    
    $db->update('users', [
        'last_login_at' => date('Y-m-d H:i:s'),
        'last_login_ip' => $_SERVER['REMOTE_ADDR'] ?? ''
    ], 'id = :id', ['id' => $user['id']]);
    
    $session = createUserSession($db, $user['id'], $config);
    
    jsonResponse([
        'success' => true,
        'data' => [
            'user' => getUserSafeData($user),
            'token' => $session['token'],
            'expires_at' => $session['expires_at']
        ]
    ]);
}

function generateWechatQR($db, $config) {
    $scene = 'login_' . generateToken(16);
    
    $wechatConfig = $config['wechat'] ?? [];
    $appId = $wechatConfig['app_id'] ?? '';
    
    $qrUrl = $config['app']['url'] . '/login.php?scene=' . $scene;
    
    if (empty($appId)) {
        jsonResponse([
            'success' => true,
            'data' => [
                'scene' => $scene,
                'qr_url' => $qrUrl,
                'mock' => true
            ]
        ]);
    }
    
    jsonResponse([
        'success' => true,
        'data' => [
            'scene' => $scene,
            'qr_url' => $qrUrl
        ]
    ]);
}

function checkWechatLogin($db) {
    $scene = $_GET['scene'] ?? '';
    
    if (empty($scene)) {
        jsonResponse(['success' => false, 'message' => '缺少场景参数']);
    }
    
    jsonResponse([
        'success' => true,
        'data' => [
            'status' => 'waiting',
            'poll_interval' => 2
        ]
    ]);
}

function logoutUser($db) {
    $user = getCurrentUser($db);
    if ($user) {
        $token = null;
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $token = str_replace('Bearer ', '', $headers['Authorization']);
        }
        if ($token) {
            $db->delete('user_sessions', 'session_token = ?', [$token]);
        }
    }
    
    jsonResponse(['success' => true]);
}

function getUserInfo($db) {
    $user = getCurrentUser($db);
    
    if (!$user) {
        jsonResponse(['success' => false, 'message' => '未登录'], 401);
    }
    
    jsonResponse([
        'success' => true,
        'data' => getUserSafeData($user)
    ]);
}

function updateUserProfile($db) {
    $user = getCurrentUser($db);
    
    if (!$user) {
        jsonResponse(['success' => false, 'message' => '未登录'], 401);
    }
    
    $input = getInput();
    $updateData = [];
    
    if (isset($input['nickname'])) {
        $nickname = sanitizeInput($input['nickname']);
        if (empty($nickname)) {
            jsonResponse(['success' => false, 'message' => '昵称不能为空']);
        }
        $updateData['nickname'] = $nickname;
    }
    
    if (isset($input['email'])) {
        $email = sanitizeInput($input['email']);
        if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['success' => false, 'message' => '邮箱格式不正确']);
        }
        $updateData['email'] = $email;
    }
    
    if (empty($updateData)) {
        jsonResponse(['success' => true]);
        return;
    }
    
    $db->update('users', $updateData, 'id = :id', ['id' => $user['id']]);
    
    $updatedUser = $db->fetchOne('SELECT * FROM users WHERE id = ?', [$user['id']]);
    
    jsonResponse([
        'success' => true,
        'data' => getUserSafeData($updatedUser)
    ]);
}

function updateUserAvatar($db, $config) {
    $user = getCurrentUser($db);
    
    if (!$user) {
        jsonResponse(['success' => false, 'message' => '未登录'], 401);
    }
    
    if (!isset($_FILES['avatar'])) {
        jsonResponse(['success' => false, 'message' => '请选择要上传的图片']);
    }
    
    $file = $_FILES['avatar'];
    $appConfig = $config['app'];
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        jsonResponse(['success' => false, 'message' => '文件上传错误']);
    }
    
    if ($file['size'] > $appConfig['max_avatar_size']) {
        jsonResponse(['success' => false, 'message' => '图片大小超过限制（最大2MB）']);
    }
    
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, $appConfig['allowed_avatar_types'])) {
        jsonResponse(['success' => false, 'message' => '不支持的图片类型']);
    }
    
    $avatarDir = $appConfig['avatar_dir'];
    if (!file_exists($avatarDir)) {
        mkdir($avatarDir, 0777, true);
    }
    
    $fileName = $user['id'] . '_' . time() . '.' . $extension;
    $filePath = $avatarDir . $fileName;
    
    if ($file['tmp_name']) {
        $imageInfo = @getimagesize($file['tmp_name']);
        if (!$imageInfo) {
            jsonResponse(['success' => false, 'message' => '无效的图片文件']);
        }
    }
    
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        jsonResponse(['success' => false, 'message' => '文件保存失败']);
    }
    
    if (!empty($user['avatar']) && file_exists($avatarDir . $user['avatar'])) {
        @unlink($avatarDir . $user['avatar']);
    }
    
    $db->update('users', ['avatar' => $fileName], 'id = :id', ['id' => $user['id']]);
    
    $avatarUrl = $appConfig['url'] . $appConfig['avatar_url'] . $fileName;
    
    jsonResponse([
        'success' => true,
        'data' => [
            'avatar' => $fileName,
            'avatar_url' => $avatarUrl
        ]
    ]);
}

function updateUserPassword($db) {
    $user = getCurrentUser($db);
    
    if (!$user) {
        jsonResponse(['success' => false, 'message' => '未登录'], 401);
    }
    
    $input = getInput();
    $oldPassword = $input['old_password'] ?? '';
    $newPassword = $input['new_password'] ?? '';
    
    if (empty($oldPassword) || empty($newPassword)) {
        jsonResponse(['success' => false, 'message' => '请输入旧密码和新密码']);
    }
    
    if (!validatePassword($newPassword)) {
        jsonResponse(['success' => false, 'message' => '新密码长度至少6位']);
    }
    
    $currentUser = $db->fetchOne('SELECT password FROM users WHERE id = ?', [$user['id']]);
    
    if (!password_verify($oldPassword, $currentUser['password'])) {
        jsonResponse(['success' => false, 'message' => '旧密码错误']);
    }
    
    $db->update('users', [
        'password' => password_hash($newPassword, PASSWORD_DEFAULT)
    ], 'id = :id', ['id' => $user['id']]);
    
    jsonResponse(['success' => true, 'message' => '密码修改成功']);
}

function generateSmsCode($db, $phone, $type = 'register') {
    $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    $expiresAt = time() + 15 * 60;
    
    try {
        $db->insert('password_reset_codes', [
            'user_id' => 0,
            'phone' => $phone,
            'code' => $code,
            'type' => $type,
            'expires_at' => $expiresAt,
            'used' => 0,
            'created_at' => time()
        ]);
    } catch (Exception $e) {
        $db->update('password_reset_codes', [
            'code' => $code,
            'expires_at' => $expiresAt,
            'used' => 0,
            'created_at' => time()
        ], 'phone = :phone AND type = :type AND used = 0', ['phone' => $phone, 'type' => $type]);
    }
    
    return $code;
}

function verifySmsCode($db, $phone, $code, $type = 'register') {
    $record = $db->fetchOne(
        'SELECT * FROM password_reset_codes 
         WHERE phone = ? AND code = ? AND type = ? AND used = 0 AND expires_at > ?
         ORDER BY id DESC LIMIT 1',
        [$phone, $code, $type, time()]
    );
    
    if ($record) {
        $db->update('password_reset_codes', ['used' => 1], 'id = :id', ['id' => $record['id']]);
        return true;
    }
    
    return false;
}

function sendRegisterCode($db, $config) {
    $input = getInput();
    $phone = sanitizePhone($input['phone'] ?? '');
    
    if (empty($phone) || !validatePhone($phone)) {
        jsonResponse(['success' => false, 'message' => '请输入正确的手机号']);
    }
    
    $existing = $db->fetchOne('SELECT id FROM users WHERE phone = ?', [$phone]);
    if ($existing) {
        jsonResponse(['success' => false, 'message' => '该手机号已注册']);
    }
    
    $code = generateSmsCode($db, $phone, 'register');
    
    jsonResponse([
        'success' => true,
        'message' => '验证码已发送（演示模式：' . $code . '）',
        'data' => [
            'expires_in' => 900
        ]
    ]);
}

function sendResetCode($db, $config) {
    $input = getInput();
    $phone = sanitizePhone($input['phone'] ?? '');
    
    if (empty($phone) || !validatePhone($phone)) {
        jsonResponse(['success' => false, 'message' => '请输入正确的手机号']);
    }
    
    $user = $db->fetchOne('SELECT id FROM users WHERE phone = ?', [$phone]);
    
    if (!$user) {
        jsonResponse(['success' => false, 'message' => '该手机号未注册']);
    }
    
    $code = generateSmsCode($db, $phone, 'reset');
    
    jsonResponse([
        'success' => true,
        'message' => '验证码已发送（演示模式：' . $code . '）',
        'data' => [
            'expires_in' => 900
        ]
    ]);
}

function verifyCode($db) {
    $input = getInput();
    $phone = sanitizePhone($input['phone'] ?? '');
    $code = $input['code'] ?? '';
    $type = $input['type'] ?? 'register';
    
    if (empty($phone) || !validatePhone($phone)) {
        jsonResponse(['success' => false, 'message' => '请输入正确的手机号']);
    }
    
    if (empty($code)) {
        jsonResponse(['success' => false, 'message' => '请输入验证码']);
    }
    
    if (!in_array($type, ['register', 'reset'])) {
        jsonResponse(['success' => false, 'message' => '无效的验证类型']);
    }
    
    if (verifySmsCode($db, $phone, $code, $type)) {
        $verifyToken = generateToken(32);
        $_SESSION['verify_' . $type . '_' . $phone] = $verifyToken;
        
        jsonResponse([
            'success' => true,
            'data' => [
                'verify_token' => $verifyToken
            ]
        ]);
    } else {
        jsonResponse(['success' => false, 'message' => '验证码错误或已过期']);
    }
}

function verifyResetCode($db) {
    $input = getInput();
    $phone = sanitizePhone($input['phone'] ?? '');
    $code = $input['code'] ?? '';
    
    if (empty($phone) || !validatePhone($phone)) {
        jsonResponse(['success' => false, 'message' => '请输入正确的手机号']);
    }
    
    if (empty($code)) {
        jsonResponse(['success' => false, 'message' => '请输入验证码']);
    }
    
    if (verifySmsCode($db, $phone, $code, 'reset')) {
        $verifyToken = generateToken(32);
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['verify_reset_' . $phone] = $verifyToken;
        
        jsonResponse([
            'success' => true,
            'data' => [
                'verify_token' => $verifyToken
            ]
        ]);
    } else {
        jsonResponse(['success' => false, 'message' => '验证码错误或已过期']);
    }
}

function resetPassword($db, $config) {
    $input = getInput();
    $phone = sanitizePhone($input['phone'] ?? '');
    $verifyToken = $input['verify_token'] ?? '';
    $newPassword = $input['new_password'] ?? '';
    
    if (empty($phone) || !validatePhone($phone)) {
        jsonResponse(['success' => false, 'message' => '请输入正确的手机号']);
    }
    
    if (empty($verifyToken)) {
        jsonResponse(['success' => false, 'message' => '缺少验证Token']);
    }
    
    if (empty($newPassword) || !validatePassword($newPassword)) {
        jsonResponse(['success' => false, 'message' => '新密码长度至少6位']);
    }
    
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    $sessionKey = 'verify_reset_' . $phone;
    if (!isset($_SESSION[$sessionKey]) || $_SESSION[$sessionKey] !== $verifyToken) {
        jsonResponse(['success' => false, 'message' => '验证已过期，请重新获取验证码']);
    }
    
    $user = $db->fetchOne('SELECT id FROM users WHERE phone = ?', [$phone]);
    
    if (!$user) {
        jsonResponse(['success' => false, 'message' => '用户不存在']);
    }
    
    $db->update('users', [
        'password' => password_hash($newPassword, PASSWORD_DEFAULT)
    ], 'id = :id', ['id' => $user['id']]);
    
    unset($_SESSION[$sessionKey]);
    
    jsonResponse(['success' => true, 'message' => '密码重置成功']);
}
