<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>问卷系统</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        .user-menu {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            padding: 5px 10px;
            border-radius: 20px;
            transition: background 0.2s;
        }
        
        .user-info:hover {
            background: var(--bg);
        }
        
        .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: 600;
            overflow: hidden;
        }
        
        .user-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .user-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--text);
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .dropdown {
            position: relative;
        }
        
        .dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 5px;
            background: var(--white);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            min-width: 160px;
            padding: 8px 0;
            display: none;
            z-index: 1000;
        }
        
        .dropdown-menu.active {
            display: block;
        }
        
        .dropdown-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 16px;
            cursor: pointer;
            transition: background 0.2s;
            font-size: 14px;
            color: var(--text);
        }
        
        .dropdown-item:hover {
            background: var(--bg);
        }
        
        .dropdown-item.danger {
            color: var(--danger);
        }
        
        .dropdown-divider {
            height: 1px;
            background: var(--border);
            margin: 8px 0;
        }
        
        .btn-login {
            background: var(--primary);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }
        
        .btn-login:hover {
            background: var(--primary-hover);
        }
        
        .profile-modal .avatar-upload {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .profile-modal .avatar-preview {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 36px;
            margin: 0 auto 15px;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .profile-modal .avatar-preview:hover {
            transform: scale(1.05);
        }
        
        .profile-modal .avatar-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .profile-modal .avatar-tip {
            font-size: 12px;
            color: var(--text-muted);
        }
        
        .profile-modal .form-row {
            display: flex;
            gap: 15px;
        }
        
        .profile-modal .form-row .form-group {
            flex: 1;
        }
    </style>
</head>
<body>
    <div id="app">
        <header class="app-header">
            <div class="container">
                <h1 class="logo">📋 问卷系统</h1>
                <nav class="nav">
                    <button class="nav-btn active" data-view="list">问卷列表</button>
                    <button class="nav-btn" data-view="templates">模板市场</button>
                </nav>
                <div class="user-menu" id="user-menu">
                </div>
            </div>
        </header>
        
        <main class="container">
            <div id="view-list" class="view active">
                <div class="page-header">
                    <h2>我的问卷</h2>
                    <div class="page-header-actions">
                        <button class="btn btn-primary" id="create-survey">+ 创建空白问卷</button>
                    </div>
                </div>
                <div id="survey-list" class="survey-list"></div>
            </div>
            
            <div id="view-templates" class="view">
                <div class="page-header">
                    <h2>模板市场</h2>
                    <div class="template-categories">
                        <button class="category-btn active" data-category="all">全部</button>
                        <button class="category-btn" data-category="satisfaction">满意度</button>
                        <button class="category-btn" data-category="survey">报名表</button>
                        <button class="category-btn" data-category="quiz">测验</button>
                        <button class="category-btn" data-category="other">其他</button>
                    </div>
                </div>
                <div id="template-list" class="template-list"></div>
            </div>
        </main>
    </div>
    
    <div class="modal" id="modal-profile">
        <div class="modal-content profile-modal">
            <div class="modal-header">
                <h3>个人资料</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="avatar-upload">
                    <div class="avatar-preview" id="profile-avatar">
                    </div>
                    <div class="avatar-tip">点击头像可更换图片（支持JPG/PNG/GIF，最大2MB）</div>
                    <input type="file" id="avatar-input" accept="image/*" style="display: none;">
                </div>
                <div class="form-group">
                    <label>昵称</label>
                    <input type="text" id="profile-nickname" placeholder="请输入昵称">
                </div>
                <div class="form-group">
                    <label>邮箱</label>
                    <input type="email" id="profile-email" placeholder="请输入邮箱（可选）">
                </div>
                <div class="form-group">
                    <label>手机号</label>
                    <input type="text" id="profile-phone" readonly style="background: var(--bg);">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="app.closeProfileModal()">取消</button>
                <button class="btn btn-primary" onclick="app.saveProfile()">保存</button>
            </div>
        </div>
    </div>
    
    <div class="modal" id="modal-password">
        <div class="modal-content">
            <div class="modal-header">
                <h3>修改密码</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>原密码</label>
                    <input type="password" id="pwd-old" placeholder="请输入原密码">
                </div>
                <div class="form-group">
                    <label>新密码</label>
                    <input type="password" id="pwd-new" placeholder="请输入新密码（至少6位）">
                </div>
                <div class="form-group">
                    <label>确认新密码</label>
                    <input type="password" id="pwd-confirm" placeholder="请再次输入新密码">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="app.closePasswordModal()">取消</button>
                <button class="btn btn-primary" onclick="app.changePassword()">确认修改</button>
            </div>
        </div>
    </div>
    
    <div class="modal" id="modal-template-preview">
        <div class="modal-content template-preview-modal">
            <div class="modal-header">
                <h3 id="preview-title">模板预览</h3>
                <button class="modal-close" onclick="app.closeTemplatePreview()">&times;</button>
            </div>
            <div class="modal-body" id="preview-content">
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="app.closeTemplatePreview()">取消</button>
                <button class="btn btn-primary" id="use-template-btn">使用此模板</button>
            </div>
        </div>
    </div>
    
    <script src="assets/js/app.js"></script>
</body>
</html>
