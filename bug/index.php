<?php
require_once 'config/database.php';
require_once 'includes/functions.php';

require_login();

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

$bugs = [];
while ($row = $result->fetchArray()) {
    $bugs[] = $row;
}

$users_result = $db->query("SELECT id, real_name, role FROM users ORDER BY real_name");
$users = [];
while ($row = $users_result->fetchArray()) {
    $users[] = $row;
}

include 'includes/header.php';
?>
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2><i class="bi bi-list-ul me-2"></i>BUG列表</h2>
    <div>
        <a href="javascript:void(0)" class="btn btn-outline-success me-2" onclick="exportCSV()">
            <i class="bi bi-file-earmark-spreadsheet me-1"></i>导出CSV
        </a>
        <a href="bug_create.php" class="btn btn-primary">
            <i class="bi bi-plus-lg me-1"></i>上报BUG
        </a>
    </div>
</div>

<script>
function exportCSV() {
    const params = new URLSearchParams(window.location.search);
    params.set('type', 'csv');
    window.location.href = 'export.php?' + params.toString();
}
</script>

<div class="card mb-4">
    <div class="card-body">
        <form method="GET" class="row g-3">
            <div class="col-md-3">
                <input type="text" class="form-control" name="search" placeholder="搜索标题..." value="<?php echo isset($_GET['search']) ? $_GET['search'] : ''; ?>">
            </div>
            <div class="col-md-2">
                <select class="form-select" name="status">
                    <option value="">全部状态</option>
                    <option value="pending" <?php echo (isset($_GET['status']) && $_GET['status'] == 'pending') ? 'selected' : ''; ?>>待处理</option>
                    <option value="processing" <?php echo (isset($_GET['status']) && $_GET['status'] == 'processing') ? 'selected' : ''; ?>>处理中</option>
                    <option value="verifying" <?php echo (isset($_GET['status']) && $_GET['status'] == 'verifying') ? 'selected' : ''; ?>>待验证</option>
                    <option value="closed" <?php echo (isset($_GET['status']) && $_GET['status'] == 'closed') ? 'selected' : ''; ?>>已关闭</option>
                </select>
            </div>
            <div class="col-md-2">
                <select class="form-select" name="severity">
                    <option value="">全部严重程度</option>
                    <option value="critical" <?php echo (isset($_GET['severity']) && $_GET['severity'] == 'critical') ? 'selected' : ''; ?>>致命</option>
                    <option value="high" <?php echo (isset($_GET['severity']) && $_GET['severity'] == 'high') ? 'selected' : ''; ?>>严重</option>
                    <option value="medium" <?php echo (isset($_GET['severity']) && $_GET['severity'] == 'medium') ? 'selected' : ''; ?>>一般</option>
                    <option value="low" <?php echo (isset($_GET['severity']) && $_GET['severity'] == 'low') ? 'selected' : ''; ?>>轻微</option>
                </select>
            </div>
            <div class="col-md-2">
                <select class="form-select" name="assignee">
                    <option value="">全部指派人</option>
                    <option value="unassigned" <?php echo (isset($_GET['assignee']) && $_GET['assignee'] == 'unassigned') ? 'selected' : ''; ?>>未分配</option>
                    <option value="me" <?php echo (isset($_GET['assignee']) && $_GET['assignee'] == 'me') ? 'selected' : ''; ?>>分配给我</option>
                    <?php foreach ($users as $user): ?>
                    <option value="<?php echo $user['id']; ?>" <?php echo (isset($_GET['assignee']) && $_GET['assignee'] == $user['id']) ? 'selected' : ''; ?>>
                        <?php echo $user['real_name']; ?>
                    </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="col-md-2">
                <select class="form-select" name="module">
                    <option value="">全部模块</option>
                    <option value="登录模块" <?php echo (isset($_GET['module']) && $_GET['module'] == '登录模块') ? 'selected' : ''; ?>>登录模块</option>
                    <option value="用户管理" <?php echo (isset($_GET['module']) && $_GET['module'] == '用户管理') ? 'selected' : ''; ?>>用户管理</option>
                    <option value="订单模块" <?php echo (isset($_GET['module']) && $_GET['module'] == '订单模块') ? 'selected' : ''; ?>>订单模块</option>
                    <option value="商品模块" <?php echo (isset($_GET['module']) && $_GET['module'] == '商品模块') ? 'selected' : ''; ?>>商品模块</option>
                    <option value="其他" <?php echo (isset($_GET['module']) && $_GET['module'] == '其他') ? 'selected' : ''; ?>>其他</option>
                </select>
            </div>
            <div class="col-md-1">
                <button type="submit" class="btn btn-primary w-100">
                    <i class="bi bi-search"></i>
                </button>
            </div>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-body">
        <?php if (empty($bugs)): ?>
            <div class="text-center py-5">
                <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
                <p class="mt-3 text-muted">暂无BUG记录</p>
            </div>
        <?php else: ?>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>标题</th>
                            <th>状态</th>
                            <th>严重程度</th>
                            <th>优先级</th>
                            <th>模块</th>
                            <th>创建人</th>
                            <th>指派人</th>
                            <th>创建时间</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($bugs as $bug): ?>
                        <tr>
                            <td>#<?php echo $bug['id']; ?></td>
                            <td>
                                <a href="bug_detail.php?id=<?php echo $bug['id']; ?>" class="text-decoration-none">
                                    <?php echo mb_substr($bug['title'], 0, 30); ?>
                                    <?php if (mb_strlen($bug['title']) > 30) echo '...'; ?>
                                </a>
                            </td>
                            <td><span class="badge bg-<?php echo get_status_class($bug['status']); ?>"><?php echo get_status_text($bug['status']); ?></span></td>
                            <td><span class="badge bg-<?php echo get_severity_class($bug['severity']); ?>"><?php echo get_severity_text($bug['severity']); ?></span></td>
                            <td><span class="badge bg-<?php echo get_priority_class($bug['priority']); ?>"><?php echo get_priority_text($bug['priority']); ?></span></td>
                            <td><?php echo $bug['module'] ?: '-'; ?></td>
                            <td><?php echo $bug['creator_name']; ?></td>
                            <td><?php echo $bug['assignee_name'] ?: '<span class="text-muted">未分配</span>'; ?></td>
                            <td><?php echo format_date($bug['created_at']); ?></td>
                            <td>
                                <a href="bug_detail.php?id=<?php echo $bug['id']; ?>" class="btn btn-sm btn-outline-primary">
                                    <i class="bi bi-eye"></i>
                                </a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
