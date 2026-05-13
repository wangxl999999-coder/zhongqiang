<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BUG管理系统</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
        }
        .navbar {
            box-shadow: 0 2px 4px rgba(0,0,0,.1);
        }
        .card {
            box-shadow: 0 2px 4px rgba(0,0,0,.05);
            border: none;
        }
        .btn {
            border-radius: 6px;
        }
        .badge {
            font-weight: 500;
        }
    </style>
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
    <div class="container">
        <a class="navbar-brand" href="/index.php">
            <i class="bi bi-bug-fill me-2"></i>BUG管理系统
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <?php if (is_logged_in()): ?>
            <ul class="navbar-nav me-auto">
                <li class="nav-item">
                    <a class="nav-link" href="/index.php">
                        <i class="bi bi-list-ul me-1"></i>BUG列表
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/bug_create.php">
                        <i class="bi bi-plus-circle me-1"></i>上报BUG
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/statistics.php">
                        <i class="bi bi-bar-chart me-1"></i>统计看板
                    </a>
                </li>
                <?php if ($_SESSION['user_role'] == 'admin'): ?>
                <li class="nav-item">
                    <a class="nav-link" href="/users.php">
                        <i class="bi bi-people me-1"></i>用户管理
                    </a>
                </li>
                <?php endif; ?>
            </ul>
            <ul class="navbar-nav">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                        <i class="bi bi-person-circle me-1"></i>
                        <?php echo $_SESSION['real_name']; ?>
                        <span class="badge bg-light text-primary ms-1"><?php echo get_role_text($_SESSION['user_role']); ?></span>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="/logout.php">
                            <i class="bi bi-box-arrow-right me-2"></i>退出登录
                        </a></li>
                    </ul>
                </li>
            </ul>
            <?php endif; ?>
        </div>
    </div>
</nav>
<div class="container">
