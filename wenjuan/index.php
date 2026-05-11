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
                    <button class="nav-btn" data-view="templates">模板市场</button>
                </nav>
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
