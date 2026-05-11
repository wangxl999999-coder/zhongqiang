<?php
$redirect = $_GET['redirect'] ?? 'index.php';
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>登录 - 问卷系统</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        
        .auth-container {
            width: 100%;
            max-width: 420px;
        }
        
        .auth-card {
            background: var(--white);
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .auth-header {
            padding: 30px 30px 20px;
            text-align: center;
        }
        
        .auth-logo {
            font-size: 48px;
            margin-bottom: 10px;
        }
        
        .auth-title {
            font-size: 24px;
            font-weight: 700;
            color: var(--text);
        }
        
        .auth-tabs {
            display: flex;
            border-bottom: 1px solid var(--border);
        }
        
        .auth-tab {
            flex: 1;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            font-weight: 500;
            color: var(--text-muted);
            transition: all 0.2s;
            border: none;
            background: none;
        }
        
        .auth-tab:hover {
            color: var(--primary);
        }
        
        .auth-tab.active {
            color: var(--primary);
            border-bottom: 2px solid var(--primary);
        }
        
        .auth-body {
            padding: 30px;
        }
        
        .auth-form {
            display: none;
        }
        
        .auth-form.active {
            display: block;
        }
        
        .form-row {
            display: flex;
            gap: 10px;
        }
        
        .form-row .form-group {
            flex: 1;
        }
        
        .form-row .btn {
            flex-shrink: 0;
            white-space: nowrap;
        }
        
        .btn-outline {
            background: transparent;
            border: 1px solid var(--primary);
            color: var(--primary);
        }
        
        .btn-outline:hover {
            background: #eef2ff;
        }
        
        .divider {
            display: flex;
            align-items: center;
            gap: 15px;
            margin: 25px 0;
            color: var(--text-muted);
            font-size: 14px;
        }
        
        .divider::before,
        .divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: var(--border);
        }
        
        .social-login {
            display: flex;
            gap: 15px;
        }
        
        .social-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--white);
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
        }
        
        .social-btn:hover {
            background: var(--bg);
            border-color: var(--primary);
        }
        
        .social-btn.wechat {
            color: #07c160;
        }
        
        .social-icon {
            font-size: 20px;
        }
        
        .auth-footer {
            text-align: center;
            padding: 20px;
            border-top: 1px solid var(--border);
            color: var(--text-muted);
            font-size: 14px;
        }
        
        .auth-footer a {
            color: var(--primary);
            text-decoration: none;
        }
        
        .auth-footer a:hover {
            text-decoration: underline;
        }
        
        .error-message {
            background: #fee2e2;
            color: #dc2626;
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        .success-message {
            background: #d1fae5;
            color: #059669;
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        .qr-section {
            text-align: center;
            padding: 20px;
        }
        
        .qr-code-container {
            width: 200px;
            height: 200px;
            margin: 0 auto 20px;
            background: var(--bg);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        .qr-tip {
            color: var(--text-muted);
            font-size: 14px;
        }
        
        .loading-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid var(--primary);
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 0.8s linear infinite;
            vertical-align: middle;
            margin-right: 8px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .countdown {
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <div class="auth-logo">📋</div>
                <h1 class="auth-title">问卷系统</h1>
            </div>
            
            <div class="auth-tabs">
                <button class="auth-tab active" data-tab="login">登录</button>
                <button class="auth-tab" data-tab="register">注册</button>
            </div>
            
            <div class="auth-body">
                <div id="message-container"></div>
                
                <form id="form-login" class="auth-form active">
                    <div class="form-group">
                        <label>手机号/用户名</label>
                        <input type="text" id="login-account" placeholder="请输入手机号或用户名">
                    </div>
                    <div class="form-group">
                        <label>密码</label>
                        <input type="password" id="login-password" placeholder="请输入密码">
                    </div>
                    <div style="text-align: right; margin-bottom: 20px;">
                        <a href="javascript:void(0)" onclick="switchTab('forgot')" style="color: var(--primary); text-decoration: none; font-size: 14px;">忘记密码？</a>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block" id="btn-login">登录</button>
                    
                    <div class="divider">其他登录方式</div>
                    <div class="social-login">
                        <button type="button" class="social-btn wechat" onclick="wechatLogin()">
                            <span class="social-icon">💬</span>
                            微信扫码登录
                        </button>
                    </div>
                </form>
                
                <form id="form-register" class="auth-form">
                    <div class="form-group">
                        <label>手机号</label>
                        <input type="tel" id="register-phone" placeholder="请输入手机号">
                    </div>
                    <div class="form-group">
                        <label>验证码</label>
                        <div class="form-row">
                            <input type="text" id="register-code" placeholder="请输入验证码">
                            <button type="button" class="btn btn-outline" id="btn-send-code">获取验证码</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>昵称（可选）</label>
                        <input type="text" id="register-nickname" placeholder="请输入昵称">
                    </div>
                    <div class="form-group">
                        <label>密码</label>
                        <input type="password" id="register-password" placeholder="请输入密码（至少6位）">
                    </div>
                    <div class="form-group">
                        <label>确认密码</label>
                        <input type="password" id="register-confirm-password" placeholder="请再次输入密码">
                    </div>
                    <button type="submit" class="btn btn-primary btn-block" id="btn-register">注册</button>
                </form>
                
                <form id="form-forgot" class="auth-form">
                    <div class="form-group">
                        <label>手机号</label>
                        <input type="tel" id="forgot-phone" placeholder="请输入手机号">
                    </div>
                    <div class="form-group">
                        <label>验证码</label>
                        <div class="form-row">
                            <input type="text" id="forgot-code" placeholder="请输入验证码">
                            <button type="button" class="btn btn-outline" id="btn-forgot-send-code">获取验证码</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>新密码</label>
                        <input type="password" id="forgot-new-password" placeholder="请输入新密码（至少6位）">
                    </div>
                    <div class="form-group">
                        <label>确认新密码</label>
                        <input type="password" id="forgot-confirm-password" placeholder="请再次输入新密码">
                    </div>
                    <button type="submit" class="btn btn-primary btn-block" id="btn-reset">重置密码</button>
                    <div style="text-align: center; margin-top: 15px;">
                        <a href="javascript:void(0)" onclick="switchTab('login')" style="color: var(--primary); text-decoration: none; font-size: 14px;">返回登录</a>
                    </div>
                </form>
                
                <div id="form-wechat" class="auth-form">
                    <div class="qr-section">
                        <div class="qr-code-container" id="qr-container">
                            <div style="color: var(--text-muted);">加载中...</div>
                        </div>
                        <p class="qr-tip">请使用微信扫描二维码登录</p>
                        <p class="qr-tip" id="qr-status" style="margin-top: 10px;">等待扫描...</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="javascript:void(0)" onclick="switchTab('login')" style="color: var(--primary); text-decoration: none; font-size: 14px;">返回账号登录</a>
                    </div>
                </div>
            </div>
            
            <div class="auth-footer">
                登录即表示同意 <a href="#">用户协议</a> 和 <a href="#">隐私政策</a>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    <script>
        const API_BASE = 'api/auth.php';
        const REDIRECT_URL = '<?php echo htmlspecialchars($redirect); ?>';
        
        let codeCountdown = null;
        let qrPollTimer = null;
        let qrScene = null;
        
        function showMessage(message, type = 'error') {
            const container = document.getElementById('message-container');
            const className = type === 'error' ? 'error-message' : 'success-message';
            container.innerHTML = `<div class="${className}">${message}</div>`;
            setTimeout(() => {
                container.innerHTML = '';
            }, 5000);
        }
        
        function switchTab(tab) {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            
            if (tab === 'login' || tab === 'register') {
                document.querySelector(`.auth-tab[data-tab="${tab}"]`).classList.add('active');
            }
            
            document.getElementById(`form-${tab}`).classList.add('active');
            
            if (tab === 'wechat') {
                initWechatQR();
            } else if (qrPollTimer) {
                clearInterval(qrPollTimer);
                qrPollTimer = null;
            }
        }
        
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });
        
        async function request(action, method = 'POST', data = null) {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            if (data) {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(`${API_BASE}?action=${action}`, options);
            return response.json();
        }
        
        function startCountdown(btn, seconds = 60) {
            let remaining = seconds;
            btn.disabled = true;
            btn.innerHTML = `<span class="countdown">${remaining}s</span>`;
            
            codeCountdown = setInterval(() => {
                remaining--;
                if (remaining <= 0) {
                    clearInterval(codeCountdown);
                    btn.disabled = false;
                    btn.innerHTML = '获取验证码';
                } else {
                    btn.innerHTML = `<span class="countdown">${remaining}s</span>`;
                }
            }, 1000);
        }
        
        document.getElementById('btn-send-code').addEventListener('click', async function() {
            const phone = document.getElementById('register-phone').value.trim();
            if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
                showMessage('请输入正确的手机号');
                return;
            }
            
            const result = await request('send_register_code', 'POST', { phone });
            if (result.success) {
                showMessage(result.message, 'success');
                startCountdown(this);
            } else {
                showMessage(result.message || '发送失败');
            }
        });
        
        document.getElementById('btn-forgot-send-code').addEventListener('click', async function() {
            const phone = document.getElementById('forgot-phone').value.trim();
            if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
                showMessage('请输入正确的手机号');
                return;
            }
            
            const result = await request('send_reset_code', 'POST', { phone });
            if (result.success) {
                showMessage(result.message, 'success');
                startCountdown(this);
            } else {
                showMessage(result.message || '发送失败');
            }
        });
        
        document.getElementById('form-login').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const btn = document.getElementById('btn-login');
            btn.disabled = true;
            btn.innerHTML = '<span class="loading-spinner"></span>登录中...';
            
            try {
                const result = await request('login', 'POST', {
                    account: document.getElementById('login-account').value.trim(),
                    password: document.getElementById('login-password').value
                });
                
                if (result.success) {
                    localStorage.setItem('auth_token', result.data.token);
                    localStorage.setItem('user_info', JSON.stringify(result.data.user));
                    showMessage('登录成功，正在跳转...', 'success');
                    setTimeout(() => {
                        location.href = REDIRECT_URL;
                    }, 1000);
                } else {
                    showMessage(result.message || '登录失败');
                    btn.disabled = false;
                    btn.innerHTML = '登录';
                }
            } catch (err) {
                showMessage('网络错误，请稍后重试');
                btn.disabled = false;
                btn.innerHTML = '登录';
            }
        });
        
        document.getElementById('form-register').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const phone = document.getElementById('register-phone').value.trim();
            const code = document.getElementById('register-code').value.trim();
            const nickname = document.getElementById('register-nickname').value.trim();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
                showMessage('请输入正确的手机号');
                return;
            }
            
            if (!code) {
                showMessage('请输入验证码');
                return;
            }
            
            if (!password || password.length < 6) {
                showMessage('密码长度至少6位');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('两次输入的密码不一致');
                return;
            }
            
            const btn = document.getElementById('btn-register');
            btn.disabled = true;
            btn.innerHTML = '<span class="loading-spinner"></span>注册中...';
            
            try {
                const result = await request('register', 'POST', {
                    phone,
                    password,
                    nickname,
                    code
                });
                
                if (result.success) {
                    localStorage.setItem('auth_token', result.data.token);
                    localStorage.setItem('user_info', JSON.stringify(result.data.user));
                    showMessage('注册成功，正在跳转...', 'success');
                    setTimeout(() => {
                        location.href = REDIRECT_URL;
                    }, 1000);
                } else {
                    showMessage(result.message || '注册失败');
                    btn.disabled = false;
                    btn.innerHTML = '注册';
                }
            } catch (err) {
                showMessage('网络错误，请稍后重试');
                btn.disabled = false;
                btn.innerHTML = '注册';
            }
        });
        
        document.getElementById('form-forgot').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const phone = document.getElementById('forgot-phone').value.trim();
            const code = document.getElementById('forgot-code').value.trim();
            const newPassword = document.getElementById('forgot-new-password').value;
            const confirmPassword = document.getElementById('forgot-confirm-password').value;
            
            if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
                showMessage('请输入正确的手机号');
                return;
            }
            
            if (!code) {
                showMessage('请输入验证码');
                return;
            }
            
            if (!newPassword || newPassword.length < 6) {
                showMessage('新密码长度至少6位');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showMessage('两次输入的密码不一致');
                return;
            }
            
            const btn = document.getElementById('btn-reset');
            btn.disabled = true;
            btn.innerHTML = '<span class="loading-spinner"></span>重置中...';
            
            try {
                let verifyResult = await request('verify_reset_code', 'POST', { phone, code });
                
                if (!verifyResult.success) {
                    showMessage(verifyResult.message || '验证码错误');
                    btn.disabled = false;
                    btn.innerHTML = '重置密码';
                    return;
                }
                
                const result = await request('reset_password', 'POST', {
                    phone,
                    verify_token: verifyResult.data.verify_token,
                    new_password: newPassword
                });
                
                if (result.success) {
                    showMessage('密码重置成功，请使用新密码登录', 'success');
                    setTimeout(() => {
                        switchTab('login');
                    }, 1500);
                } else {
                    showMessage(result.message || '重置失败');
                }
                
                btn.disabled = false;
                btn.innerHTML = '重置密码';
            } catch (err) {
                showMessage('网络错误，请稍后重试');
                btn.disabled = false;
                btn.innerHTML = '重置密码';
            }
        });
        
        async function initWechatQR() {
            const container = document.getElementById('qr-container');
            container.innerHTML = '<div style="color: var(--text-muted);">加载中...</div>';
            
            const result = await request('wechat_qr', 'POST');
            if (result.success) {
                qrScene = result.data.scene;
                container.innerHTML = '';
                new QRCode(container, {
                    text: result.data.qr_url,
                    width: 180,
                    height: 180,
                    correctLevel: QRCode.CorrectLevel.M
                });
                
                startQRCheck();
            } else {
                container.innerHTML = '<div style="color: var(--danger);">生成二维码失败</div>';
            }
        }
        
        function startQRCheck() {
            if (qrPollTimer) clearInterval(qrPollTimer);
            
            qrPollTimer = setInterval(async () => {
                if (!qrScene) return;
                
                const result = await request('wechat_check', 'GET', null);
                if (result.success) {
                    if (result.data.status === 'success') {
                        clearInterval(qrPollTimer);
                        localStorage.setItem('auth_token', result.data.token);
                        localStorage.setItem('user_info', JSON.stringify(result.data.user));
                        showMessage('登录成功，正在跳转...', 'success');
                        setTimeout(() => {
                            location.href = REDIRECT_URL;
                        }, 1000);
                    } else if (result.data.status === 'waiting') {
                        document.getElementById('qr-status').textContent = '等待扫描...';
                    } else if (result.data.status === 'scanned') {
                        document.getElementById('qr-status').textContent = '已扫描，请在手机上确认';
                    } else if (result.data.status === 'expired') {
                        clearInterval(qrPollTimer);
                        document.getElementById('qr-status').textContent = '二维码已过期，点击刷新';
                    }
                }
            }, 2000);
        }
        
        function wechatLogin() {
            switchTab('wechat');
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                fetch(`${API_BASE}?action=get_user`, {
                    headers: { 'Authorization': 'Bearer ' + token }
                }).then(r => r.json()).then(result => {
                    if (result.success) {
                        location.href = REDIRECT_URL;
                    }
                });
            }
        });
    </script>
</body>
</html>
