<?php
require_once 'config/database.php';
require_once 'includes/functions.php';

require_role('admin');

$message = '';
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] == 'create') {
        $username = sanitize_input($_POST['username']);
        $real_name = sanitize_input($_POST['real_name']);
        $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
        $role = sanitize_input($_POST['role']);

        $stmt = $db->prepare("INSERT INTO users (username, password, real_name, role) VALUES (?, ?, ?, ?)");
        $stmt->bindValue(1, $username);
        $stmt->bindValue(2, $password);
        $stmt->bindValue(3, $real_name);
        $stmt->bindValue(4, $role);
        if ($stmt->execute()) {
            $message = '用户创建成功';
        } else {
            $message = '创建失败，用户名可能已存在';
        }
    } elseif ($_POST['action'] == 'delete') {
        $id = intval($_POST['id']);
        if ($id != $_SESSION['user_id']) {
            $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
            $stmt->bindValue(1, $id);
            $stmt->execute();
            $message = '用户删除成功';
        }
    }
}

$result = $db->query("SELECT * FROM users ORDER BY id");
$users = [];
while ($row = $result->fetchArray()) {
    $users[] = $row;
}

include 'includes/header.php';
?>
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2><i class="bi bi-people me-2"></i>用户管理</h2>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createModal">
        <i class="bi bi-plus-lg me-1"></i>添加用户
    </button>
</div>

<?php if ($message): ?>
    <div class="alert alert-info alert-dismissible fade show">
        <?php echo $message; ?>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
<?php endif; ?>

<div class="card">
    <div class="card-body">
        <table class="table table-hover">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>用户名</th>
                    <th>姓名</th>
                    <th>角色</th>
                    <th>创建时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($users as $user): ?>
                <tr>
                    <td><?php echo $user['id']; ?></td>
                    <td><?php echo $user['username']; ?></td>
                    <td><?php echo $user['real_name']; ?></td>
                    <td><span class="badge bg-<?php echo $user['role'] == 'admin' ? 'danger' : ($user['role'] == 'developer' ? 'primary' : 'success'); ?>">
                        <?php echo get_role_text($user['role']); ?>
                    </span></td>
                    <td><?php echo format_date($user['created_at']); ?></td>
                    <td>
                        <?php if ($user['id'] != $_SESSION['user_id']): ?>
                        <form method="POST" class="d-inline" onsubmit="return confirm('确定删除此用户？');">
                            <input type="hidden" name="action" value="delete">
                            <input type="hidden" name="id" value="<?php echo $user['id']; ?>">
                            <button type="submit" class="btn btn-sm btn-outline-danger">
                                <i class="bi bi-trash"></i>
                            </button>
                        </form>
                        <?php endif; ?>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<div class="modal fade" id="createModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form method="POST">
                <div class="modal-header">
                    <h5 class="modal-title">添加用户</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" name="action" value="create">
                    <div class="mb-3">
                        <label class="form-label">用户名</label>
                        <input type="text" class="form-control" name="username" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">姓名</label>
                        <input type="text" class="form-control" name="real_name" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">密码</label>
                        <input type="password" class="form-control" name="password" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">角色</label>
                        <select class="form-select" name="role" required>
                            <option value="tester">测试人员</option>
                            <option value="developer">开发人员</option>
                            <option value="admin">管理员</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="submit" class="btn btn-primary">创建</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
