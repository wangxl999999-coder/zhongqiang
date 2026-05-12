<?php
require_once 'config/database.php';
require_once 'includes/functions.php';

require_login();

if (!isset($_GET['id'])) {
    redirect('index.php');
}

$bug_id = intval($_GET['id']);
$current_user = get_current_user();

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
    redirect('index.php');
}

$message = '';
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $action = $_POST['action'];
    
    if ($action == 'assign' && $current_user['role'] == 'admin') {
        $assignee_id = intval($_POST['assignee_id']);
        $stmt = $db->prepare("UPDATE bugs SET assignee_id = ?, status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->bindValue(1, $assignee_id);
        $stmt->bindValue(2, $bug_id);
        $stmt->execute();
        
        $stmt = $db->prepare("INSERT INTO bug_history (bug_id, old_status, new_status, operator_id, remark) VALUES (?, ?, ?, ?, ?)");
        $stmt->bindValue(1, $bug_id);
        $stmt->bindValue(2, $bug['status']);
        $stmt->bindValue(3, 'processing');
        $stmt->bindValue(4, $current_user['id']);
        $stmt->bindValue(5, '分配BUG');
        $stmt->execute();
        
        $message = 'BUG分配成功';
    } elseif ($action == 'claim' && $current_user['role'] == 'developer' && !$bug['assignee_id']) {
        $stmt = $db->prepare("UPDATE bugs SET assignee_id = ?, status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->bindValue(1, $current_user['id']);
        $stmt->bindValue(2, $bug_id);
        $stmt->execute();
        
        $stmt = $db->prepare("INSERT INTO bug_history (bug_id, old_status, new_status, operator_id, remark) VALUES (?, ?, ?, ?, ?)");
        $stmt->bindValue(1, $bug_id);
        $stmt->bindValue(2, $bug['status']);
        $stmt->bindValue(3, 'processing');
        $stmt->bindValue(4, $current_user['id']);
        $stmt->bindValue(5, '认领BUG');
        $stmt->execute();
        
        $message = 'BUG认领成功';
    } elseif ($action == 'update_status') {
        $new_status = sanitize_input($_POST['status']);
        $solution = isset($_POST['solution']) ? sanitize_input($_POST['solution']) : '';
        $remark = sanitize_input($_POST['remark']);
        
        $can_update = false;
        if ($current_user['role'] == 'admin') {
            $can_update = true;
        } elseif ($current_user['role'] == 'developer' && $bug['assignee_id'] == $current_user['id']) {
            if (in_array($new_status, ['processing', 'verifying'])) {
                $can_update = true;
            }
        } elseif ($current_user['role'] == 'tester') {
            if ($bug['status'] == 'verifying' && $new_status == 'closed') {
                $can_update = true;
            }
        }
        
        if ($can_update) {
            $update_fields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
            $update_params = [$new_status];
            
            if ($solution && ($current_user['role'] == 'developer' || $current_user['role'] == 'admin')) {
                $update_fields[] = 'solution = ?';
                $update_params[] = $solution;
            }
            
            $update_params[] = $bug_id;
            $stmt = $db->prepare("UPDATE bugs SET " . implode(', ', $update_fields) . " WHERE id = ?");
            foreach ($update_params as $i => $param) {
                $stmt->bindValue($i + 1, $param);
            }
            $stmt->execute();
            
            $stmt = $db->prepare("INSERT INTO bug_history (bug_id, old_status, new_status, operator_id, remark) VALUES (?, ?, ?, ?, ?)");
            $stmt->bindValue(1, $bug_id);
            $stmt->bindValue(2, $bug['status']);
            $stmt->bindValue(3, $new_status);
            $stmt->bindValue(4, $current_user['id']);
            $stmt->bindValue(5, $remark);
            $stmt->execute();
            
            $message = '状态更新成功';
        } else {
            $message = '权限不足';
        }
    }
    
    if ($message) {
        header("Location: bug_detail.php?id=$bug_id&message=" . urlencode($message));
        exit;
    }
}

if (isset($_GET['message'])) {
    $message = $_GET['message'];
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

$users_result = $db->query("SELECT id, real_name FROM users WHERE role = 'developer' ORDER BY real_name");
$developers = [];
while ($row = $users_result->fetchArray()) {
    $developers[] = $row;
}

include 'includes/header.php';
?>
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>
        <i class="bi bi-bug me-2"></i>BUG #<?php echo $bug['id']; ?>
        <span class="badge bg-<?php echo get_status_class($bug['status']); ?> ms-2"><?php echo get_status_text($bug['status']); ?></span>
    </h2>
    <a href="index.php" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-1"></i>返回列表
    </a>
</div>

<?php if ($message): ?>
    <div class="alert alert-info alert-dismissible fade show">
        <?php echo $message; ?>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
<?php endif; ?>

<div class="row">
    <div class="col-lg-8">
        <div class="card mb-4">
            <div class="card-header bg-light">
                <h5 class="mb-0"><?php echo $bug['title']; ?></h5>
            </div>
            <div class="card-body">
                <div class="mb-4">
                    <h6 class="text-muted mb-2">详细描述</h6>
                    <p class="mb-0"><?php echo nl2br($bug['description']); ?></p>
                </div>
                
                <?php if ($bug['reproduce_steps']): ?>
                <div class="mb-4">
                    <h6 class="text-muted mb-2">重现步骤</h6>
                    <p class="mb-0"><?php echo nl2br($bug['reproduce_steps']); ?></p>
                </div>
                <?php endif; ?>
                
                <?php if ($bug['solution']): ?>
                <div class="mb-4">
                    <h6 class="text-muted mb-2">解决方案</h6>
                    <p class="mb-0 text-success"><?php echo nl2br($bug['solution']); ?></p>
                </div>
                <?php endif; ?>
                
                <?php if ($bug['screenshot']): ?>
                <div class="mb-4">
                    <h6 class="text-muted mb-2">截图</h6>
                    <img src="<?php echo $bug['screenshot']; ?>" class="img-fluid rounded" style="max-height: 400px;">
                </div>
                <?php endif; ?>
            </div>
        </div>

        <div class="card">
            <div class="card-header bg-light">
                <h5 class="mb-0"><i class="bi bi-clock-history me-2"></i>操作历史</h5>
            </div>
            <div class="card-body">
                <?php if (empty($history)): ?>
                    <p class="text-muted mb-0">暂无操作记录</p>
                <?php else: ?>
                    <div class="timeline">
                        <?php foreach ($history as $item): ?>
                        <div class="d-flex mb-3">
                            <div class="me-3 text-center">
                                <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                    <i class="bi bi-arrow-right text-white"></i>
                                </div>
                            </div>
                            <div class="flex-grow-1">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <strong><?php echo $item['operator_name']; ?></strong>
                                        <?php if ($item['old_status']): ?>
                                        <span class="mx-2">
                                            <span class="badge bg-secondary"><?php echo get_status_text($item['old_status']); ?></span>
                                            <i class="bi bi-arrow-right mx-1"></i>
                                            <span class="badge bg-<?php echo get_status_class($item['new_status']); ?>"><?php echo get_status_text($item['new_status']); ?></span>
                                        </span>
                                        <?php endif; ?>
                                    </div>
                                    <small class="text-muted"><?php echo format_date($item['created_at']); ?></small>
                                </div>
                                <?php if ($item['remark']): ?>
                                <p class="mt-1 mb-0 text-muted"><?php echo $item['remark']; ?></p>
                                <?php endif; ?>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <div class="col-lg-4">
        <div class="card mb-4">
            <div class="card-header bg-light">
                <h5 class="mb-0">BUG信息</h5>
            </div>
            <div class="card-body">
                <table class="table table-borderless table-sm">
                    <tr>
                        <td class="text-muted">严重程度</td>
                        <td><span class="badge bg-<?php echo get_severity_class($bug['severity']); ?>"><?php echo get_severity_text($bug['severity']); ?></span></td>
                    </tr>
                    <tr>
                        <td class="text-muted">优先级</td>
                        <td><span class="badge bg-<?php echo get_priority_class($bug['priority']); ?>"><?php echo get_priority_text($bug['priority']); ?></span></td>
                    </tr>
                    <tr>
                        <td class="text-muted">创建人</td>
                        <td><?php echo $bug['creator_name']; ?></td>
                    </tr>
                    <tr>
                        <td class="text-muted">指派人</td>
                        <td><?php echo $bug['assignee_name'] ?: '<span class="text-muted">未分配</span>'; ?></td>
                    </tr>
                    <tr>
                        <td class="text-muted">版本号</td>
                        <td><?php echo $bug['version'] ?: '-'; ?></td>
                    </tr>
                    <tr>
                        <td class="text-muted">所属模块</td>
                        <td><?php echo $bug['module'] ?: '-'; ?></td>
                    </tr>
                    <tr>
                        <td class="text-muted">发现阶段</td>
                        <td><?php echo $bug['discovery_phase'] ?: '-'; ?></td>
                    </tr>
                    <tr>
                        <td class="text-muted">创建时间</td>
                        <td><?php echo format_date($bug['created_at']); ?></td>
                    </tr>
                    <tr>
                        <td class="text-muted">更新时间</td>
                        <td><?php echo format_date($bug['updated_at']); ?></td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header bg-light">
                <h5 class="mb-0">操作</h5>
            </div>
            <div class="card-body">
                <?php if ($current_user['role'] == 'admin' && !$bug['assignee_id']): ?>
                <form method="POST" class="mb-3">
                    <input type="hidden" name="action" value="assign">
                    <div class="mb-2">
                        <label class="form-label small">分配给开发人员</label>
                        <select class="form-select" name="assignee_id" required>
                            <option value="">请选择</option>
                            <?php foreach ($developers as $dev): ?>
                            <option value="<?php echo $dev['id']; ?>"><?php echo $dev['real_name']; ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">
                        <i class="bi bi-person-plus me-1"></i>分配BUG
                    </button>
                </form>
                <?php endif; ?>

                <?php if ($current_user['role'] == 'developer' && !$bug['assignee_id']): ?>
                <form method="POST" class="mb-3">
                    <input type="hidden" name="action" value="claim">
                    <button type="submit" class="btn btn-success w-100">
                        <i class="bi bi-hand-index me-1"></i>认领此BUG
                    </button>
                </form>
                <?php endif; ?>

                <?php 
                $can_update_status = false;
                $available_statuses = [];
                
                if ($current_user['role'] == 'admin') {
                    $can_update_status = true;
                    $available_statuses = ['pending', 'processing', 'verifying', 'closed'];
                } elseif ($current_user['role'] == 'developer' && $bug['assignee_id'] == $current_user['id']) {
                    $can_update_status = true;
                    if ($bug['status'] == 'pending' || $bug['status'] == 'processing') {
                        $available_statuses = ['processing', 'verifying'];
                    }
                } elseif ($current_user['role'] == 'tester' && $bug['status'] == 'verifying') {
                    $can_update_status = true;
                    $available_statuses = ['closed'];
                }
                
                if ($can_update_status && !empty($available_statuses)):
                ?>
                <form method="POST">
                    <input type="hidden" name="action" value="update_status">
                    <div class="mb-2">
                        <label class="form-label small">更新状态</label>
                        <select class="form-select" name="status" required>
                            <?php foreach ($available_statuses as $status): ?>
                            <option value="<?php echo $status; ?>" <?php echo $bug['status'] == $status ? 'selected' : ''; ?>>
                                <?php echo get_status_text($status); ?>
                            </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    
                    <?php if ($current_user['role'] == 'developer' || $current_user['role'] == 'admin'): ?>
                    <div class="mb-2">
                        <label class="form-label small">解决方案</label>
                        <textarea class="form-control" name="solution" rows="2" placeholder="请输入解决方案..."><?php echo $bug['solution']; ?></textarea>
                    </div>
                    <?php endif; ?>
                    
                    <div class="mb-2">
                        <label class="form-label small">备注</label>
                        <textarea class="form-control" name="remark" rows="2" placeholder="请输入操作备注..." required></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-primary w-100">
                        <i class="bi bi-check-lg me-1"></i>更新状态
                    </button>
                </form>
                <?php endif; ?>

                <?php if (!$can_update_status): ?>
                    <p class="text-muted mb-0 text-center">暂无可执行的操作</p>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
