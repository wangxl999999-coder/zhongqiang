<?php
require_once 'config/database.php';
require_once 'includes/functions.php';

require_login();

$period = isset($_GET['period']) ? $_GET['period'] : 'day';

$total_bugs = $db->querySingle("SELECT COUNT(*) FROM bugs");

$unresolved_bugs = $db->querySingle("SELECT COUNT(*) FROM bugs WHERE status IN ('pending', 'processing', 'verifying')");

$today = date('Y-m-d');
$today_new = $db->querySingle("SELECT COUNT(*) FROM bugs WHERE DATE(created_at) = '$today'");

$week_start = date('Y-m-d', strtotime('monday this week'));
$week_closed = $db->querySingle("SELECT COUNT(*) FROM bugs WHERE status = 'closed' AND DATE(updated_at) >= '$week_start'");

$trend_data = [];
if ($period == 'day') {
    for ($i = 13; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $new = $db->querySingle("SELECT COUNT(*) FROM bugs WHERE DATE(created_at) = '$date'");
        $closed = $db->querySingle("SELECT COUNT(*) FROM bugs WHERE status = 'closed' AND DATE(updated_at) = '$date'");
        $trend_data[] = [
            'date' => date('m-d', strtotime($date)),
            'new' => $new,
            'closed' => $closed
        ];
    }
} else {
    for ($i = 7; $i >= 0; $i--) {
        $week_start_date = date('Y-m-d', strtotime("monday -$i weeks"));
        $week_end_date = date('Y-m-d', strtotime("sunday -$i weeks"));
        $new = $db->querySingle("SELECT COUNT(*) FROM bugs WHERE DATE(created_at) >= '$week_start_date' AND DATE(created_at) <= '$week_end_date'");
        $closed = $db->querySingle("SELECT COUNT(*) FROM bugs WHERE status = 'closed' AND DATE(updated_at) >= '$week_start_date' AND DATE(updated_at) <= '$week_end_date'");
        $trend_data[] = [
            'date' => date('m/d', strtotime($week_start_date)),
            'new' => $new,
            'closed' => $closed
        ];
    }
}

$user_stats = $db->query("SELECT u.id, u.real_name, u.role,
                                 COUNT(b.id) as assigned_count,
                                 SUM(CASE WHEN b.status IN ('pending', 'processing', 'verifying') THEN 1 ELSE 0 END) as pending_count
                          FROM users u
                          LEFT JOIN bugs b ON u.id = b.assignee_id
                          WHERE u.role = 'developer'
                          GROUP BY u.id
                          ORDER BY pending_count DESC");

$per_user_stats = [];
while ($row = $user_stats->fetchArray()) {
    $per_user_stats[] = $row;
}

$age_distribution = [
    '0-3天' => 0,
    '4-7天' => 0,
    '8-14天' => 0,
    '15-30天' => 0,
    '30天以上' => 0
];

$age_result = $db->query("SELECT created_at FROM bugs WHERE status IN ('pending', 'processing', 'verifying')");
while ($row = $age_result->fetchArray()) {
    $days = (time() - strtotime($row['created_at'])) / (60 * 60 * 24);
    if ($days <= 3) {
        $age_distribution['0-3天']++;
    } elseif ($days <= 7) {
        $age_distribution['4-7天']++;
    } elseif ($days <= 14) {
        $age_distribution['8-14天']++;
    } elseif ($days <= 30) {
        $age_distribution['15-30天']++;
    } else {
        $age_distribution['30天以上']++;
    }
}

include 'includes/header.php';
?>
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2><i class="bi bi-bar-chart me-2"></i>统计看板</h2>
</div>

<div class="row mb-4">
    <div class="col-md-3">
        <div class="card bg-primary text-white h-100">
            <div class="card-body text-center">
                <i class="bi bi-bug" style="font-size: 2rem;"></i>
                <h3 class="mt-2 mb-0"><?php echo $total_bugs; ?></h3>
                <p class="mb-0">总BUG数</p>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card bg-warning text-dark h-100">
            <div class="card-body text-center">
                <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
                <h3 class="mt-2 mb-0"><?php echo $unresolved_bugs; ?></h3>
                <p class="mb-0">未解决</p>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card bg-success text-white h-100">
            <div class="card-body text-center">
                <i class="bi bi-plus-circle" style="font-size: 2rem;"></i>
                <h3 class="mt-2 mb-0"><?php echo $today_new; ?></h3>
                <p class="mb-0">今日新增</p>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card bg-info text-white h-100">
            <div class="card-body text-center">
                <i class="bi bi-check-circle" style="font-size: 2rem;"></i>
                <h3 class="mt-2 mb-0"><?php echo $week_closed; ?></h3>
                <p class="mb-0">本周关闭</p>
            </div>
        </div>
    </div>
</div>

<div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0"><i class="bi bi-graph-up me-2"></i>BUG趋势图</h5>
        <div class="btn-group">
            <a href="?period=day" class="btn btn-sm <?php echo $period == 'day' ? 'btn-primary' : 'btn-outline-primary'; ?>">按天</a>
            <a href="?period=week" class="btn btn-sm <?php echo $period == 'week' ? 'btn-primary' : 'btn-outline-primary'; ?>">按周</a>
        </div>
    </div>
    <div class="card-body">
        <canvas id="trendChart" height="100"></canvas>
    </div>
</div>

<div class="row">
    <div class="col-md-6">
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0"><i class="bi bi-people me-2"></i>开发人员待修复统计</h5>
            </div>
            <div class="card-body">
                <canvas id="pendingChart" height="200"></canvas>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0"><i class="bi bi-clock me-2"></i>BUG年龄分布（未解决）</h5>
            </div>
            <div class="card-body">
                <canvas id="ageChart" height="200"></canvas>
            </div>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5 class="mb-0"><i class="bi bi-person-badge me-2"></i>人均BUG统计</h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>开发人员</th>
                        <th>分配总数</th>
                        <th>待修复数</th>
                        <th>已解决</th>
                        <th>解决率</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($per_user_stats as $stat): ?>
                    <tr>
                        <td><?php echo $stat['real_name']; ?></td>
                        <td><span class="badge bg-primary"><?php echo $stat['assigned_count']; ?></span></td>
                        <td><span class="badge bg-warning"><?php echo $stat['pending_count']; ?></span></td>
                        <td><span class="badge bg-success"><?php echo $stat['assigned_count'] - $stat['pending_count']; ?></span></td>
                        <td>
                            <?php 
                            $rate = $stat['assigned_count'] > 0 ? round(($stat['assigned_count'] - $stat['pending_count']) / $stat['assigned_count'] * 100, 1) : 0;
                            echo '<span class="badge bg-' . ($rate >= 80 ? 'success' : ($rate >= 50 ? 'info' : 'warning')) . '">' . $rate . '%</span>';
                            ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script>
const trendCtx = document.getElementById('trendChart').getContext('2d');
new Chart(trendCtx, {
    type: 'line',
    data: {
        labels: <?php echo json_encode(array_column($trend_data, 'date')); ?>,
        datasets: [
            {
                label: '新增BUG',
                data: <?php echo json_encode(array_column($trend_data, 'new')); ?>,
                borderColor: 'rgb(255, 193, 7)',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                tension: 0.3,
                fill: true
            },
            {
                label: '关闭BUG',
                data: <?php echo json_encode(array_column($trend_data, 'closed')); ?>,
                borderColor: 'rgb(25, 135, 84)',
                backgroundColor: 'rgba(25, 135, 84, 0.1)',
                tension: 0.3,
                fill: true
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    }
});

const pendingCtx = document.getElementById('pendingChart').getContext('2d');
new Chart(pendingCtx, {
    type: 'bar',
    data: {
        labels: <?php echo json_encode(array_column($per_user_stats, 'real_name')); ?>,
        datasets: [
            {
                label: '待修复BUG',
                data: <?php echo json_encode(array_column($per_user_stats, 'pending_count')); ?>,
                backgroundColor: 'rgba(255, 193, 7, 0.7)',
                borderColor: 'rgb(255, 193, 7)',
                borderWidth: 1
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    }
});

const ageCtx = document.getElementById('ageChart').getContext('2d');
new Chart(ageCtx, {
    type: 'doughnut',
    data: {
        labels: <?php echo json_encode(array_keys($age_distribution)); ?>,
        datasets: [
            {
                data: <?php echo json_encode(array_values($age_distribution)); ?>,
                backgroundColor: [
                    'rgba(25, 135, 84, 0.7)',
                    'rgba(13, 202, 240, 0.7)',
                    'rgba(13, 110, 253, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(220, 53, 69, 0.7)'
                ],
                borderWidth: 1
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'right'
            }
        }
    }
});
</script>

<?php include 'includes/footer.php'; ?>