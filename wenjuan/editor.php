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
                    <button class="btn" id="btn-collaborators">👥 协作</button>
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
            <div class="modal-content modal-wide">
                <div class="modal-header">
                    <h3>问卷设置</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="settings-tabs">
                        <button class="settings-tab active" data-tab="basic">基本设置</button>
                        <button class="settings-tab" data-tab="security">安全与限制</button>
                    </div>
                    
                    <div class="settings-content">
                        <div class="settings-panel active" data-panel="basic">
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
                        
                        <div class="settings-panel" data-panel="security">
                            <div class="form-group">
                                <label>答题时长限制（分钟）</label>
                                <input type="number" id="setting-time-limit" min="1" max="1440" placeholder="不限则留空">
                                <div class="field-hint">设置后，答题者必须在规定时间内完成问卷，超时将自动提交</div>
                            </div>
                            <div class="form-group">
                                <label>IP访问限制</label>
                                <div class="radio-group">
                                    <label class="radio-label">
                                        <input type="radio" name="ip-limit-type" value="0" checked> 不限制
                                    </label>
                                    <label class="radio-label">
                                        <input type="radio" name="ip-limit-type" value="1"> 白名单模式（仅允许）
                                    </label>
                                    <label class="radio-label">
                                        <input type="radio" name="ip-limit-type" value="2"> 黑名单模式（禁止访问）
                                    </label>
                                </div>
                            </div>
                            <div class="form-group" id="ip-whitelist-group" style="display: none;">
                                <label>IP白名单</label>
                                <textarea id="setting-ip-whitelist" rows="3" placeholder="支持单个IP或CIDR格式（如192.168.1.0/24），多个用逗号分隔"></textarea>
                                <div class="field-hint">只有列表中的IP地址可以访问此问卷</div>
                            </div>
                            <div class="form-group" id="ip-blacklist-group" style="display: none;">
                                <label>IP黑名单</label>
                                <textarea id="setting-ip-blacklist" rows="3" placeholder="支持单个IP或CIDR格式（如192.168.1.0/24），多个用逗号分隔"></textarea>
                                <div class="field-hint">列表中的IP地址将被禁止访问此问卷</div>
                            </div>
                        </div>
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
        
        <div class="modal" id="modal-collaborators">
            <div class="modal-content modal-wide">
                <div class="modal-header">
                    <h3>协作成员管理</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="collaborator-section">
                        <div class="collaborator-add">
                            <input type="text" id="collaborator-name" placeholder="输入用户名或邮箱" style="flex: 1;">
                            <select id="collaborator-role" style="width: 120px;">
                                <option value="editor">编辑者</option>
                                <option value="viewer">查看者</option>
                            </select>
                            <button class="btn btn-primary" id="add-collaborator">添加</button>
                        </div>
                        <div class="collaborator-list" id="collaborator-list">
                            <div class="empty-hint" style="text-align: center; padding: 40px 0; color: var(--text-muted);">暂无协作成员</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn" onclick="app.closeCollaboratorsModal()">关闭</button>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    <script src="assets/js/editor.js"></script>
</body>
</html>
