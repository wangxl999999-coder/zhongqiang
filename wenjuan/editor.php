<?php
$surveyId = $_GET['id'] ?? 0;
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>问卷编辑器</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/editor.css">
</head>
<body>
    <div id="editor-app" data-survey-id="<?php echo $surveyId; ?>">
        <header class="editor-header">
            <div class="container">
                <div class="header-left">
                    <button class="btn btn-link" onclick="location.href='index.php'">← 返回</button>
                    <input type="text" id="survey-title" class="title-input" placeholder="问卷标题">
                </div>
                <div class="header-right">
                    <button class="btn" id="btn-preview">预览</button>
                    <button class="btn" id="btn-settings">设置</button>
                    <button class="btn" id="btn-save">保存</button>
                    <button class="btn btn-primary" id="btn-publish">发布</button>
                </div>
            </div>
        </header>
        
        <div class="editor-container">
            <aside class="sidebar">
                <h3>添加题型</h3>
                <div class="question-types" id="question-types">
                    <div class="type-item" draggable="true" data-type="radio">
                        <span class="type-icon">◉</span> 单选题
                    </div>
                    <div class="type-item" draggable="true" data-type="checkbox">
                        <span class="type-icon">☑</span> 多选题
                    </div>
                    <div class="type-item" draggable="true" data-type="text">
                        <span class="type-icon">▭</span> 单行文本
                    </div>
                    <div class="type-item" draggable="true" data-type="textarea">
                        <span class="type-icon">▭</span> 多行文本
                    </div>
                    <div class="type-item" draggable="true" data-type="select">
                        <span class="type-icon">▼</span> 下拉框
                    </div>
                    <div class="type-item" draggable="true" data-type="rating">
                        <span class="type-icon">★</span> 评分
                    </div>
                    <div class="type-item" draggable="true" data-type="date">
                        <span class="type-icon">📅</span> 日期
                    </div>
                    <div class="type-item" draggable="true" data-type="file">
                        <span class="type-icon">📎</span> 文件上传
                    </div>
                    <div class="type-item" draggable="true" data-type="paragraph">
                        <span class="type-icon">¶</span> 段落说明
                    </div>
                </div>
                
                <div class="page-controls">
                    <button class="btn btn-block" id="add-page">+ 添加分页</button>
                </div>
            </aside>
            
            <main class="editor-main">
                <div class="description-section">
                    <textarea id="survey-description" placeholder="添加问卷说明（可选）"></textarea>
                </div>
                <div id="questions-container" class="questions-container"></div>
                <div class="drop-zone" id="drop-zone">
                    <p>拖拽题型到此处，或点击左侧题型添加</p>
                </div>
            </main>
            
            <aside class="property-panel" id="property-panel">
                <div class="empty-hint">选择题目以编辑属性</div>
            </aside>
        </div>
        
        <div class="modal" id="modal-settings">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>问卷设置</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>截止时间</label>
                        <input type="datetime-local" id="setting-end-time">
                    </div>
                    <div class="form-group">
                        <label>最大回收份数</label>
                        <input type="number" id="setting-max-responses" min="0" placeholder="不限制留空">
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="setting-limit-once"> 限答一次（按IP限制）
                        </label>
                    </div>
                    <div class="form-group">
                        <label>访问密码</label>
                        <input type="text" id="setting-password" placeholder="留空则无需密码">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn" id="cancel-settings">取消</button>
                    <button class="btn btn-primary" id="save-settings">保存设置</button>
                </div>
            </div>
        </div>
        
        <div class="modal" id="modal-publish">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>发布问卷</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body publish-body">
                    <div class="publish-info">
                        <div class="form-group">
                            <label>问卷链接</label>
                            <div class="link-group">
                                <input type="text" id="share-url" readonly>
                                <button class="btn" id="copy-url">复制</button>
                            </div>
                        </div>
                        <div class="qr-section">
                            <label>二维码</label>
                            <div id="qr-code" class="qr-code"></div>
                            <button class="btn" id="download-qr">下载二维码</button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn" id="unpublish">停止回收</button>
                    <button class="btn btn-primary" id="confirm-publish">确认发布</button>
                </div>
            </div>
        </div>
        
        <div class="modal" id="modal-preview">
            <div class="modal-content modal-wide">
                <div class="modal-header">
                    <h3>预览问卷</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body preview-body">
                    <div id="preview-container" class="preview-container"></div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    <script src="assets/js/editor.js"></script>
</body>
</html>
