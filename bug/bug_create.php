<?php
require_once 'config/database.php';
require_once 'includes/functions.php';

require_login();

$message = '';
$bug_id = null;

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $title = sanitize_input($_POST['title']);
    $description = sanitize_input($_POST['description']);
    $reproduce_steps = sanitize_input($_POST['reproduce_steps']);
    $severity = sanitize_input($_POST['severity']);
    $priority = sanitize_input($_POST['priority']);
    $version = sanitize_input($_POST['version']);
    $module = sanitize_input($_POST['module']);
    $discovery_phase = sanitize_input($_POST['discovery_phase']);
    
    $screenshot = '';
    if (isset($_FILES['screenshot']) && $_FILES['screenshot']['error'] == 0) {
        $upload_dir = 'uploads/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        $ext = pathinfo($_FILES['screenshot']['name'], PATHINFO_EXTENSION);
        $screenshot = $upload_dir . uniqid() . '.' . $ext;
        move_uploaded_file($_FILES['screenshot']['tmp_name'], $screenshot);
    }

    $stmt = $db->prepare("INSERT INTO bugs (title, description, reproduce_steps, severity, priority, version, module, discovery_phase, screenshot, creator_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bindValue(1, $title);
    $stmt->bindValue(2, $description);
    $stmt->bindValue(3, $reproduce_steps);
    $stmt->bindValue(4, $severity);
    $stmt->bindValue(5, $priority);
    $stmt->bindValue(6, $version);
    $stmt->bindValue(7, $module);
    $stmt->bindValue(8, $discovery_phase);
    $stmt->bindValue(9, $screenshot);
    $stmt->bindValue(10, $_SESSION['user_id']);
    
    if ($stmt->execute()) {
        $bug_id = $db->lastInsertRowID();
        $message = 'BUG上报成功！';
    } else {
        $message = '上报失败，请重试';
    }
}

include 'includes/header.php';
?>
<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-plus-circle me-2"></i>上报BUG</h2>
        </div>

        <?php if ($message): ?>
            <div class="alert alert-<?php echo $bug_id ? 'success' : 'danger'; ?> alert-dismissible fade show">
                <?php echo $message; ?>
                <?php if ($bug_id): ?>
                    <a href="/bug_detail.php?id=<?php echo $bug_id; ?>" class="alert-link">查看BUG #<?php echo $bug_id; ?></a>
                <?php endif; ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>

        <div class="card">
            <div class="card-body">
                <form method="POST" enctype="multipart/form-data">
                    <div class="row">
                        <div class="col-md-9 mb-3">
                            <label class="form-label">BUG标题 <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="title" required placeholder="请简要描述BUG问题">
                        </div>
                        <div class="col-md-3 mb-3">
                            <label class="form-label">严重程度 <span class="text-danger">*</span></label>
                            <select class="form-select" name="severity" required>
                                <option value="critical">致命</option>
                                <option value="high">严重</option>
                                <option value="medium" selected>一般</option>
                                <option value="low">轻微</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">详细描述 <span class="text-danger">*</span></label>
                        <textarea class="form-control" name="description" rows="4" required placeholder="请详细描述BUG现象..."></textarea>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">重现步骤</label>
                        <textarea class="form-control" name="reproduce_steps" rows="3" placeholder="1. 第一步...&#10;2. 第二步...&#10;3. 第三步..."></textarea>
                    </div>

                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label class="form-label">优先级</label>
                            <select class="form-select" name="priority">
                                <option value="critical">紧急</option>
                                <option value="high">高</option>
                                <option value="medium" selected>中</option>
                                <option value="low">低</option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label">版本号</label>
                            <input type="text" class="form-control" name="version" placeholder="例如：v1.0.0">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label">所属模块</label>
                            <select class="form-select" name="module">
                                <option value="">请选择</option>
                                <option value="登录模块">登录模块</option>
                                <option value="用户管理">用户管理</option>
                                <option value="订单模块">订单模块</option>
                                <option value="商品模块">商品模块</option>
                                <option value="其他">其他</option>
                            </select>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">发现阶段</label>
                            <select class="form-select" name="discovery_phase">
                                <option value="">请选择</option>
                                <option value="单元测试">单元测试</option>
                                <option value="集成测试">集成测试</option>
                                <option value="系统测试">系统测试</option>
                                <option value="回归测试">回归测试</option>
                                <option value="用户验收">用户验收</option>
                                <option value="生产环境">生产环境</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">截图上传</label>
                            <input type="file" class="form-control" name="screenshot" accept="image/*">
                        </div>
                    </div>

                    <div class="d-flex justify-content-end mt-4">
                        <button type="reset" class="btn btn-secondary me-2">
                            <i class="bi bi-arrow-counterclockwise me-1"></i>重置
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="bi bi-send me-1"></i>提交BUG
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
