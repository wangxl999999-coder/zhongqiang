<?php
$surveyId = $_GET['id'] ?? 0;
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>问卷统计</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/stats.css">
    <script src="assets/js/chart.min.js"></script>
</head>
<body>
    <div id="stats-app" data-survey-id="<?php echo $surveyId; ?>">
        <header class="app-header">
            <div class="container">
                <h1 class="logo">📋 问卷系统</h1>
                <nav class="nav">
                    <button class="nav-btn" onclick="location.href='index.php'">返回列表</button>
                </nav>
            </div>
        </header>
        
        <main class="container">
            <div class="page-header">
                <h2 id="survey-title">问卷统计</h2>
                <div class="header-actions">
                    <button class="btn" id="export-excel">导出 Excel</button>
                    <button class="btn" id="export-csv">导出 CSV</button>
                </div>
            </div>
            
            <div class="stats-summary" id="stats-summary"></div>
            
            <div class="tabs">
                <button class="tab-btn active" data-tab="charts">图表统计</button>
                <button class="tab-btn" data-tab="responses">答卷列表</button>
            </div>
            
            <div id="tab-charts" class="tab-content active">
                <div id="charts-container"></div>
            </div>
            
            <div id="tab-responses" class="tab-content">
                <div id="responses-list" class="responses-list"></div>
                <div class="pagination" id="pagination"></div>
            </div>
        </main>
    </div>
    
    <div class="modal" id="modal-detail">
        <div class="modal-content modal-wide">
            <div class="modal-header">
                <h3>答卷详情</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body" id="detail-content"></div>
        </div>
    </div>
    
    <script src="assets/js/stats.js"></script>
</body>
</html>
