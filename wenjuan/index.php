<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>问卷系统</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div id="app">
        <header class="app-header">
            <div class="container">
                <h1 class="logo">📋 问卷系统</h1>
                <nav class="nav">
                    <button class="nav-btn active" data-view="list">问卷列表</button>
                </nav>
            </div>
        </header>
        
        <main class="container">
            <div id="view-list" class="view active">
                <div class="page-header">
                    <h2>我的问卷</h2>
                    <button class="btn btn-primary" id="create-survey">+ 创建问卷</button>
                </div>
                <div id="survey-list" class="survey-list"></div>
            </div>
        </main>
    </div>
    
    <script src="assets/js/app.js"></script>
</body>
</html>
