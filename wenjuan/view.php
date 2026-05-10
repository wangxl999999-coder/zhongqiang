<?php
$token = $_GET['token'] ?? '';
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>填写问卷</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/view.css">
</head>
<body>
    <div id="view-app" data-token="<?php echo htmlspecialchars($token); ?>">
        <div class="view-container">
            <div id="survey-content"></div>
        </div>
    </div>
    
    <div class="modal" id="modal-password">
        <div class="modal-content">
            <div class="modal-header">
                <h3>请输入访问密码</h3>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <input type="password" id="access-password" placeholder="输入密码">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" id="submit-password">确认</button>
            </div>
        </div>
    </div>
    
    <div class="modal" id="modal-success">
        <div class="modal-content">
            <div class="modal-body success-modal">
                <div class="success-icon">✓</div>
                <h3>提交成功！</h3>
                <p>感谢您的参与</p>
            </div>
        </div>
    </div>
    
    <script src="assets/js/view.js"></script>
</body>
</html>
