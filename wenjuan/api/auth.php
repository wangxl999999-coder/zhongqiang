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
    
    $existing = $db->fetchOne('SELECT id FROM users WHERE phone = ?', [$phone]);
    if ($existing) {
        jsonResponse(['success' => false, 'message' => '该手机号已注册']);
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
    
    $resetToken = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    $expiresAt = date('Y-m-d H:i:s', time() + 15 * 60);
    
    $db->update('users', [
        'reset_token' => $resetToken,
        'reset_token_expire' => $expiresAt
    ], 'id = :id', ['id' => $user['id']]);
    
    jsonResponse([
        'success' => true,
        'message' => '验证码已发送（演示模式：' . $resetToken . '）',
        'data' => [
            'expires_in' => 900
        ]
    ]);
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
    
    $user = $db->fetchOne(
        'SELECT id FROM users WHERE phone = ? AND reset_token = ? AND reset_token_expire > NOW()',
        [$phone, $code]
    );
    
    if (!$user) {
        jsonResponse(['success' => false, 'message' => '验证码错误或已过期']);
    }
    
    $verifyToken = generateToken(32);
    $db->update('users', [
        'reset_token' => $verifyToken,
        'reset_token_expire' => date('Y-m-d H:i:s', time() + 30 * 60)
    ], 'id = :id', ['id' => $user['id']]);
    
    jsonResponse([
        'success' => true,
        'data' => [
            'verify_token' => $verifyToken
        ]
    ]);
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
    
    $user = $db->fetchOne(
        'SELECT id FROM users WHERE phone = ? AND reset_token = ? AND reset_token_expire > NOW()',
        [$phone, $verifyToken]
    );
    
    if (!$user) {
        jsonResponse(['success' => false, 'message' => '验证已过期，请重新获取验证码']);
    }
    
    $db->update('users', [
        'password' => password_hash($newPassword, PASSWORD_DEFAULT),
        'reset_token' => null,
        'reset_token_expire' => null
    ], 'id = :id', ['id' => $user['id']]);
    
    jsonResponse(['success' => true, 'message' => '密码重置成功']);
}
