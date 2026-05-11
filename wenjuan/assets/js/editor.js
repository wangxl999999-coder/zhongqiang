const API_BASE = 'api/api.php';
const AUTH_API = 'api/auth.php';

const editor = {
    surveyId: 0,
    survey: null,
    questions: [],
    conditions: [],
    selectedQuestionId: null,
    draggedType: null,
    dragIndex: null,
    qrCode: null,
    user: null,
    authToken: null,
    surveyPermission: null,
    
    async init() {
        this.surveyId = parseInt(document.getElementById('editor-app').dataset.surveyId);
        this.authToken = localStorage.getItem('auth_token');
        
        if (!this.authToken) {
            this.showNoPermission('请先登录', '您需要登录后才能编辑问卷');
            return;
        }
        
        await this.loadUserInfo();
        await this.checkPermission();
        
        if (this.surveyPermission) {
            this.bindEvents();
            await this.loadSurvey();
            this.updateUIByPermission();
        }
    },
    
    async loadUserInfo() {
        const result = await this.request('get_user', 'GET', null, null, true);
        if (result.success) {
            this.user = result.data;
        } else {
            this.authToken = null;
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_info');
        }
    },
    
    async checkPermission() {
        if (!this.surveyId) {
            this.surveyPermission = { success: true, role: 'owner', level: 3 };
            return;
        }
        
        const result = await this.request('get_survey', 'GET', null, { id: this.surveyId });
        
        if (!result.success) {
            if (result.message?.includes('权限') || result.code === 401) {
                this.showNoPermission('没有访问权限', '您没有权限编辑此问卷');
                return;
            }
            this.showNoPermission('问卷不存在', '您访问的问卷不存在或已被删除');
            return;
        }
        
        this.surveyPermission = result.data.permission || { success: true, role: 'owner', level: 3 };
    },
    
    showNoPermission(title, message) {
        const app = document.getElementById('editor-app');
        app.innerHTML = `
            <div class="no-permission">
                <div class="no-permission-icon">🔒</div>
                <h2>${title}</h2>
                <p>${message}</p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    ${!this.authToken ? '<button class="btn btn-primary" onclick="location.href=\'login.php?redirect=' + encodeURIComponent(location.href) + '\'">立即登录</button>' : ''}
                    <button class="btn" onclick="location.href='index.php'">返回首页</button>
                </div>
            </div>
        `;
    },
    
    updateUIByPermission() {
        const canEdit = this.surveyPermission.level >= 2;
        const canManage = this.surveyPermission.level >= 3;
        
        const editorContainer = document.querySelector('.editor-container');
        const btnSave = document.getElementById('btn-save');
        const btnPublish = document.getElementById('btn-publish');
        const btnSettings = document.getElementById('btn-settings');
        const btnCollaborators = document.getElementById('btn-collaborators');
        const surveyTitle = document.getElementById('survey-title');
        const surveyDesc = document.getElementById('survey-description');
        
        if (!canEdit) {
            if (editorContainer) editorContainer.classList.add('editor-locked');
            if (btnSave) btnSave.style.display = 'none';
            if (btnPublish) btnPublish.style.display = 'none';
            if (btnSettings) btnSettings.style.display = 'none';
            if (btnCollaborators) btnCollaborators.style.display = 'none';
            if (surveyTitle) surveyTitle.disabled = true;
            if (surveyDesc) surveyDesc.disabled = true;
            
            if (surveyTitle) {
                const badgeClass = this.surveyPermission.role === 'viewer' ? 'viewer' : 'editor';
                const badgeText = this.surveyPermission.role === 'viewer' ? '查看者' : '编辑者';
                surveyTitle.insertAdjacentHTML('afterend', `
                    <span class="permission-badge ${badgeClass}">${badgeText}</span>
                `);
            }
        }
        
        if (!canManage && btnCollaborators) {
            btnCollaborators.style.display = 'none';
        }
    },
    
    bindEvents() {
        const typeItems = document.querySelectorAll('.type-item');
        typeItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                this.draggedType = item.dataset.type;
                e.dataTransfer.effectAllowed = 'copy';
            });
            
            item.addEventListener('click', () => {
                this.addQuestion(item.dataset.type);
            });
        });
        
        const dropZone = document.getElementById('drop-zone');
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            if (this.draggedType) {
                this.addQuestion(this.draggedType);
                this.draggedType = null;
            }
        });
        
        document.getElementById('add-page').addEventListener('click', () => this.addPage());
        
        document.getElementById('btn-save').addEventListener('click', () => this.saveAll());
        document.getElementById('btn-publish').addEventListener('click', () => this.showPublishModal());
        document.getElementById('btn-preview').addEventListener('click', () => this.showPreview());
        document.getElementById('btn-settings').addEventListener('click', () => this.showSettingsModal());
        document.getElementById('btn-collaborators').addEventListener('click', () => this.showCollaboratorsModal());
        
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').classList.remove('active');
            });
        });
        
        document.getElementById('cancel-settings').addEventListener('click', () => {
            document.getElementById('modal-settings').classList.remove('active');
        });
        
        document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
        document.getElementById('confirm-publish').addEventListener('click', () => this.publishSurvey());
        document.getElementById('unpublish').addEventListener('click', () => this.unpublishSurvey());
        document.getElementById('copy-url').addEventListener('click', () => this.copyShareUrl());
        document.getElementById('add-collaborator').addEventListener('click', () => this.addCollaborator());
        
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchSettingsTab(tab.dataset.tab));
        });
        
        document.querySelectorAll('input[name="ip-limit-type"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateIpLimitFields());
        });
        
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    },
    
    async request(action, method = 'GET', data = null, params = null, isAuth = false) {
        let base = isAuth ? AUTH_API : API_BASE;
        let url = `${base}?action=${action}`;
        
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                url += `&${key}=${encodeURIComponent(value)}`;
            }
        }
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (this.authToken) {
            options.headers['Authorization'] = 'Bearer ' + this.authToken;
        }
        
        if (data && !(data instanceof FormData)) {
            options.body = JSON.stringify(data);
        } else if (data instanceof FormData) {
            delete options.headers['Content-Type'];
            options.body = data;
        }
        
        const response = await fetch(url, options);
        return response.json();
    },
    
    async loadSurvey() {
        if (this.surveyId) {
            const result = await this.request('get_survey', 'GET', null, { id: this.surveyId });
            
            if (result.success) {
                this.survey = result.data.survey;
                this.questions = result.data.questions;
                this.conditions = result.data.conditions;
                
                document.getElementById('survey-title').value = this.survey.title || '';
                document.getElementById('survey-description').value = this.survey.description || '';
            }
        }
        this.renderQuestions();
    },
    
    addQuestion(type, pageNumber = null) {
        const maxPage = this.questions.length > 0 
            ? Math.max(...this.questions.map(q => q.page_number)) 
            : 1;
        
        const page = pageNumber || maxPage;
        const pageQuestions = this.questions.filter(q => q.page_number === page);
        const maxSort = pageQuestions.length > 0 
            ? Math.max(...pageQuestions.map(q => q.sort_order)) 
            : -1;
        
        const question = {
            id: Date.now(),
            type,
            title: this.getDefaultTitle(type),
            description: '',
            page_number: page,
            sort_order: maxSort + 1,
            required: type !== 'paragraph',
            options: type === 'paragraph' ? [] : this.getDefaultOptions(type),
            config: this.getDefaultConfig(type)
        };
        
        this.questions.push(question);
        this.renderQuestions();
        this.selectQuestion(question.id);
    },
    
    getDefaultTitle(type) {
        const titles = {
            radio: '单选题',
            checkbox: '多选题',
            text: '单行文本',
            textarea: '多行文本',
            select: '下拉框',
            rating: '评分题',
            date: '日期选择',
            file: '文件上传',
            paragraph: '段落说明'
        };
        return titles[type] || '题目';
    },
    
    getDefaultOptions(type) {
        if (!['radio', 'checkbox', 'select'].includes(type)) return [];
        return [
            { id: 1, label: '选项1', value: 'option_1' },
            { id: 2, label: '选项2', value: 'option_2' }
        ];
    },
    
    getDefaultConfig(type) {
        if (type === 'rating') {
            return { min: 1, max: 5 };
        }
        if (type === 'file') {
            return { accept: '*', maxSize: 10 };
        }
        return {};
    },
    
    addPage() {
        const maxPage = this.questions.length > 0 
            ? Math.max(...this.questions.map(q => q.page_number)) 
            : 0;
        
        this.addQuestion('paragraph', maxPage + 1);
        const lastQ = this.questions[this.questions.length - 1];
        lastQ.title = `第 ${maxPage + 1} 页`;
        lastQ.description = '点击编辑分页说明';
        
        this.renderQuestions();
    },
    
    renderQuestions() {
        const container = document.getElementById('questions-container');
        
        const pages = {};
        this.questions.forEach(q => {
            if (!pages[q.page_number]) pages[q.page_number] = [];
            pages[q.page_number].push(q);
        });
        
        let html = '';
        Object.keys(pages).sort((a, b) => a - b).forEach(pageNum => {
            const pageQuestions = pages[pageNum].sort((a, b) => a.sort_order - b.sort_order);
            
            html += `
                <div class="page-section" data-page="${pageNum}">
                    <div class="page-header">
                        <span class="page-title">第 ${pageNum} 页</span>
                        <div class="page-actions">
                            <button class="btn" onclick="editor.addQuestion('radio', ${pageNum})">+ 添加题目</button>
                            ${Object.keys(pages).length > 1 ? `<button class="btn btn-danger" onclick="editor.deletePage(${pageNum})">删除页</button>` : ''}
                        </div>
                    </div>
                    ${pageQuestions.map(q => this.renderQuestion(q)).join('')}
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        container.querySelectorAll('.question-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.question-actions')) {
                    this.selectQuestion(parseInt(item.dataset.id));
                }
            });
            
            item.addEventListener('dragstart', (e) => {
                this.dragIndex = parseInt(item.dataset.id);
                e.dataTransfer.effectAllowed = 'move';
            });
            
            item.addEventListener('dragover', (e) => e.preventDefault());
            
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                const targetId = parseInt(item.dataset.id);
                if (this.dragIndex && this.dragIndex !== targetId) {
                    this.reorderQuestions(this.dragIndex, targetId);
                }
                this.dragIndex = null;
            });
        });
        
        if (this.selectedQuestionId) {
            this.selectQuestion(this.selectedQuestionId);
        }
    },
    
    renderQuestion(q) {
        const selected = q.id === this.selectedQuestionId ? 'selected' : '';
        let content = '';
        
        if (['radio', 'checkbox', 'select'].includes(q.type)) {
            content = `
                <div class="options-container">
                    ${(q.options || []).map(opt => `
                        <div class="option-item">
                            <div class="option-preview ${q.type === 'radio' ? 'radio' : ''}"></div>
                            <span class="option-label">${this.escapeHtml(opt.label)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (q.type === 'text') {
            content = '<div class="text-preview"></div>';
        } else if (q.type === 'textarea') {
            content = '<div class="textarea-preview"></div>';
        } else if (q.type === 'rating') {
            const max = q.config?.max || 5;
            content = `
                <div class="rating-preview">
                    ${Array(max).fill(0).map(() => '<span class="star">★</span>').join('')}
                </div>
            `;
        } else if (q.type === 'date') {
            content = '<div class="text-preview"></div>';
        } else if (q.type === 'file') {
            content = '<div class="text-preview" style="height: 80px;"></div>';
        }
        
        const typeLabels = {
            radio: '单选题',
            checkbox: '多选题',
            text: '单行文本',
            textarea: '多行文本',
            select: '下拉框',
            rating: '评分',
            date: '日期',
            file: '文件上传',
            paragraph: '段落说明'
        };
        
        return `
            <div class="question-item ${selected}" data-id="${q.id}" draggable="true">
                <div class="question-header">
                    <div>
                        <span class="question-type-badge">${typeLabels[q.type]}</span>
                        <div class="question-title">
                            ${this.escapeHtml(q.title)}
                            ${q.required && q.type !== 'paragraph' ? '<span class="required-mark">*</span>' : ''}
                        </div>
                        ${q.description ? `<div style="font-size: 13px; color: #6b7280; margin-top: 4px;">${this.escapeHtml(q.description)}</div>` : ''}
                    </div>
                    <div class="question-actions">
                        <button title="复制" onclick="editor.copyQuestion(${q.id})">⧉</button>
                        <button title="删除" onclick="editor.deleteQuestion(${q.id})">✕</button>
                    </div>
                </div>
                <div class="question-content">
                    ${content}
                </div>
            </div>
        `;
    },
    
    selectQuestion(id) {
        this.selectedQuestionId = id;
        
        document.querySelectorAll('.question-item').forEach(item => {
            item.classList.remove('selected');
            if (parseInt(item.dataset.id) === id) {
                item.classList.add('selected');
            }
        });
        
        const question = this.questions.find(q => q.id === id);
        if (question) {
            this.renderPropertyPanel(question);
        }
    },
    
    renderPropertyPanel(q) {
        const panel = document.getElementById('property-panel');
        
        let optionsHtml = '';
        if (['radio', 'checkbox', 'select'].includes(q.type)) {
            optionsHtml = `
                <div class="property-section">
                    <h4>选项</h4>
                    <div class="option-editor" id="option-editor">
                        ${(q.options || []).map((opt, idx) => `
                            <div class="option-editor-item" data-idx="${idx}">
                                <input type="text" value="${this.escapeHtml(opt.label)}" onchange="editor.updateOption(${q.id}, ${idx}, this.value)">
                                <button onclick="editor.removeOption(${q.id}, ${idx})">✕</button>
                            </div>
                        `).join('')}
                    </div>
                    <button class="add-option-btn" onclick="editor.addOption(${q.id})">+ 添加选项</button>
                </div>
            `;
        }
        
        let configHtml = '';
        if (q.type === 'rating') {
            configHtml = `
                <div class="property-section">
                    <h4>评分设置</h4>
                    <div class="form-group">
                        <label>最低分</label>
                        <input type="number" value="${q.config?.min || 1}" min="1" onchange="editor.updateConfig(${q.id}, 'min', parseInt(this.value))">
                    </div>
                    <div class="form-group">
                        <label>最高分</label>
                        <input type="number" value="${q.config?.max || 5}" min="2" onchange="editor.updateConfig(${q.id}, 'max', parseInt(this.value))">
                    </div>
                </div>
            `;
        }
        
        let conditionsHtml = '';
        if (['radio', 'checkbox', 'select'].includes(q.type)) {
            const otherQuestions = this.questions.filter(qq => qq.id !== q.id);
            const questionConditions = this.conditions.filter(c => c.trigger_question_id === q.id);
            
            conditionsHtml = `
                <div class="property-section">
                    <h4>条件设置</h4>
                    <div class="condition-editor" id="condition-editor">
                        ${questionConditions.map((cond, idx) => `
                            <div class="condition-item" data-idx="${idx}">
                                <div class="condition-row">
                                    <select onchange="editor.updateConditionOption(${q.id}, ${idx}, 'trigger_option_value', this.value)">
                                        <option value="">选择选项</option>
                                        ${(q.options || []).map(opt => `
                                            <option value="${opt.value}" ${cond.trigger_option_value === opt.value ? 'selected' : ''}>${this.escapeHtml(opt.label)}</option>
                                        `).join('')}
                                    </select>
                                    <select onchange="editor.updateConditionOption(${q.id}, ${idx}, 'action', this.value)">
                                        <option value="jump" ${cond.action === 'jump' ? 'selected' : ''}>跳转到</option>
                                        <option value="show" ${cond.action === 'show' ? 'selected' : ''}>显示</option>
                                        <option value="hide" ${cond.action === 'hide' ? 'selected' : ''}>隐藏</option>
                                    </select>
                                </div>
                                <div class="condition-row">
                                    <select onchange="editor.updateConditionOption(${q.id}, ${idx}, 'target_question_id', this.value)">
                                        <option value="">选择目标</option>
                                        <option value="end" ${cond.target_question_id === null ? 'selected' : ''}>结束问卷</option>
                                        ${otherQuestions.map(qq => `
                                            <option value="${qq.id}" ${cond.target_question_id == qq.id ? 'selected' : ''}>${this.escapeHtml(qq.title)}</option>
                                        `).join('')}
                                    </select>
                                    <button class="remove-condition" onclick="editor.removeCondition(${q.id}, ${idx})">删除</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="add-option-btn" onclick="editor.addCondition(${q.id})">+ 添加条件</button>
                </div>
            `;
        }
        
        panel.innerHTML = `
            <h3>题目属性</h3>
            <div class="property-form">
                <div class="property-section">
                    <h4>基本设置</h4>
                    <div class="form-group">
                        <label>题目标题</label>
                        <input type="text" value="${this.escapeHtml(q.title)}" onchange="editor.updateQuestion(${q.id}, 'title', this.value)">
                    </div>
                    <div class="form-group">
                        <label>题目说明</label>
                        <textarea rows="2" onchange="editor.updateQuestion(${q.id}, 'description', this.value)">${this.escapeHtml(q.description || '')}</textarea>
                    </div>
                    ${q.type !== 'paragraph' ? `
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" ${q.required ? 'checked' : ''} onchange="editor.updateQuestion(${q.id}, 'required', this.checked)">
                                必填
                            </label>
                        </div>
                    ` : ''}
                </div>
                ${optionsHtml}
                ${configHtml}
                ${conditionsHtml}
            </div>
        `;
    },
    
    updateQuestion(id, field, value) {
        const q = this.questions.find(qq => qq.id === id);
        if (q) {
            q[field] = value;
            this.renderQuestions();
        }
    },
    
    updateOption(qId, idx, value) {
        const q = this.questions.find(qq => qq.id === qId);
        if (q && q.options[idx]) {
            q.options[idx].label = value;
            q.options[idx].value = `option_${Date.now()}_${idx}`;
            this.renderQuestions();
            this.selectQuestion(qId);
        }
    },
    
    addOption(qId) {
        const q = this.questions.find(qq => qq.id === qId);
        if (q) {
            const idx = q.options.length;
            q.options.push({
                id: Date.now(),
                label: `选项${idx + 1}`,
                value: `option_${Date.now()}`
            });
            this.renderQuestions();
            this.selectQuestion(qId);
        }
    },
    
    removeOption(qId, idx) {
        const q = this.questions.find(qq => qq.id === qId);
        if (q && q.options.length > 1) {
            q.options.splice(idx, 1);
            this.renderQuestions();
            this.selectQuestion(qId);
        }
    },
    
    updateConfig(qId, key, value) {
        const q = this.questions.find(qq => qq.id === qId);
        if (q) {
            if (!q.config) q.config = {};
            q.config[key] = value;
            this.renderQuestions();
            this.selectQuestion(qId);
        }
    },
    
    addCondition(qId) {
        this.conditions.push({
            id: Date.now(),
            survey_id: this.surveyId,
            trigger_question_id: qId,
            trigger_option_value: '',
            action: 'jump',
            target_question_id: null
        });
        this.selectQuestion(qId);
    },
    
    updateConditionOption(qId, idx, field, value) {
        const q = this.questions.find(qq => qq.id === qId);
        if (!q) return;
        
        const conditionList = this.conditions.filter(c => c.trigger_question_id === qId);
        if (conditionList[idx]) {
            if (field === 'target_question_id' && value === 'end') {
                conditionList[idx][field] = null;
            } else if (field === 'target_question_id') {
                conditionList[idx][field] = parseInt(value);
            } else {
                conditionList[idx][field] = value;
            }
            this.selectQuestion(qId);
        }
    },
    
    removeCondition(qId, idx) {
        const conditionList = this.conditions.filter(c => c.trigger_question_id === qId);
        if (conditionList[idx]) {
            const condIdx = this.conditions.indexOf(conditionList[idx]);
            if (condIdx > -1) {
                this.conditions.splice(condIdx, 1);
                this.selectQuestion(qId);
            }
        }
    },
    
    copyQuestion(id) {
        const q = this.questions.find(qq => qq.id === id);
        if (q) {
            const newQ = JSON.parse(JSON.stringify(q));
            newQ.id = Date.now();
            newQ.sort_order = q.sort_order + 0.5;
            newQ.title = q.title + ' (副本)';
            if (newQ.options) {
                newQ.options = newQ.options.map((opt, idx) => ({
                    ...opt,
                    id: Date.now() + idx,
                    value: `option_${Date.now()}_${idx}`
                }));
            }
            this.questions.push(newQ);
            
            this.questions.sort((a, b) => {
                if (a.page_number !== b.page_number) return a.page_number - b.page_number;
                return a.sort_order - b.sort_order;
            });
            this.questions.forEach((qq, idx) => qq.sort_order = idx);
            
            this.renderQuestions();
        }
    },
    
    deleteQuestion(id) {
        const idx = this.questions.findIndex(q => q.id === id);
        if (idx > -1) {
            this.questions.splice(idx, 1);
            this.conditions = this.conditions.filter(c => 
                c.trigger_question_id !== id && c.target_question_id !== id
            );
            this.selectedQuestionId = null;
            this.renderQuestions();
            document.getElementById('property-panel').innerHTML = '<div class="empty-hint">选择题目以编辑属性</div>';
        }
    },
    
    deletePage(pageNum) {
        if (!confirm('确定要删除这一页吗？该页的所有题目将被删除。')) return;
        
        this.questions = this.questions.filter(q => q.page_number !== pageNum);
        this.questions.forEach(q => {
            if (q.page_number > pageNum) {
                q.page_number--;
            }
        });
        this.renderQuestions();
    },
    
    reorderQuestions(fromId, toId) {
        const fromQ = this.questions.find(q => q.id === fromId);
        const toQ = this.questions.find(q => q.id === toId);
        if (fromQ && toQ && fromQ.page_number === toQ.page_number) {
            const temp = fromQ.sort_order;
            fromQ.sort_order = toQ.sort_order;
            toQ.sort_order = temp;
            this.renderQuestions();
        }
    },
    
    async saveAll() {
        if (!this.surveyId) {
            const result = await this.request('create_survey', 'POST', {
                title: document.getElementById('survey-title').value || '未命名问卷',
                description: document.getElementById('survey-description').value || ''
            });
            if (result.success) {
                this.surveyId = result.data.id;
                window.history.replaceState({}, '', `editor.php?id=${this.surveyId}`);
            }
        } else {
            await this.request('update_survey', 'POST', {
                id: this.surveyId,
                title: document.getElementById('survey-title').value || '未命名问卷',
                description: document.getElementById('survey-description').value || ''
            });
        }
        
        await this.request('save_questions', 'POST', {
            survey_id: this.surveyId,
            questions: this.questions
        });
        
        if (this.conditions.length > 0) {
            await this.request('save_conditions', 'POST', {
                survey_id: this.surveyId,
                conditions: this.conditions
            });
        }
        
        alert('保存成功！');
    },
    
    async showSettingsModal() {
        if (!this.survey) await this.loadSurvey();
        
        document.getElementById('setting-end-time').value = this.survey?.end_time || '';
        document.getElementById('setting-max-responses').value = this.survey?.max_responses || '';
        document.getElementById('setting-limit-once').checked = this.survey?.limit_once === 1;
        document.getElementById('setting-password').value = '';
        
        document.getElementById('setting-time-limit').value = this.survey?.time_limit || '';
        document.getElementById('setting-ip-whitelist').value = this.survey?.ip_whitelist || '';
        document.getElementById('setting-ip-blacklist').value = this.survey?.ip_blacklist || '';
        
        const ipLimitType = this.survey?.ip_limit_type || 0;
        document.querySelectorAll('input[name="ip-limit-type"]').forEach(radio => {
            radio.checked = parseInt(radio.value) === ipLimitType;
        });
        
        this.updateIpLimitFields();
        this.switchSettingsTab('basic');
        
        document.getElementById('modal-settings').classList.add('active');
    },
    
    switchSettingsTab(tab) {
        document.querySelectorAll('.settings-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        document.querySelectorAll('.settings-panel').forEach(p => {
            p.classList.toggle('active', p.dataset.panel === tab);
        });
    },
    
    updateIpLimitFields() {
        const ipLimitType = document.querySelector('input[name="ip-limit-type"]:checked')?.value || '0';
        document.getElementById('ip-whitelist-group').style.display = ipLimitType === '1' ? 'block' : 'none';
        document.getElementById('ip-blacklist-group').style.display = ipLimitType === '2' ? 'block' : 'none';
    },
    
    async saveSettings() {
        await this.saveAll();
        
        const ipLimitType = parseInt(document.querySelector('input[name="ip-limit-type"]:checked')?.value || '0');
        
        const result = await this.request('update_survey', 'POST', {
            id: this.surveyId,
            end_time: document.getElementById('setting-end-time').value || null,
            max_responses: document.getElementById('setting-max-responses').value || null,
            limit_once: document.getElementById('setting-limit-once').checked ? 1 : 0,
            password: document.getElementById('setting-password').value || '',
            time_limit: document.getElementById('setting-time-limit').value || null,
            ip_limit_type: ipLimitType,
            ip_whitelist: ipLimitType === 1 ? document.getElementById('setting-ip-whitelist').value : '',
            ip_blacklist: ipLimitType === 2 ? document.getElementById('setting-ip-blacklist').value : ''
        });
        
        if (result.success) {
            document.getElementById('modal-settings').classList.remove('active');
            alert('设置已保存！');
        }
    },
    
    async showCollaboratorsModal() {
        await this.loadCollaborators();
        document.getElementById('modal-collaborators').classList.add('active');
    },
    
    closeCollaboratorsModal() {
        document.getElementById('modal-collaborators').classList.remove('active');
    },
    
    async loadCollaborators() {
        const result = await this.request('get_collaborators', 'GET', null, {
            survey_id: this.surveyId
        });
        
        const container = document.getElementById('collaborator-list');
        
        if (!result.success || !result.data || result.data.length === 0) {
            container.innerHTML = '<div class="empty-hint" style="text-align: center; padding: 40px 0; color: var(--text-muted);">暂无协作成员</div>';
            return;
        }
        
        const roleLabels = {
            owner: '拥有者',
            editor: '编辑者',
            viewer: '查看者'
        };
        
        container.innerHTML = result.data.map(collab => `
            <div class="collaborator-item">
                <div class="collaborator-info">
                    <div class="collaborator-avatar">${(collab.nickname || collab.username || '?').charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="collaborator-name">${this.escapeHtml(collab.nickname || collab.username)}</div>
                        <div class="collaborator-role">${roleLabels[collab.role] || collab.role}</div>
                    </div>
                </div>
                <div class="collaborator-actions">
                    ${collab.role !== 'owner' ? `
                        <select class="collaborator-role-select" data-id="${collab.id}" onchange="editor.updateCollaboratorRole(${collab.id}, this.value)">
                            <option value="viewer" ${collab.role === 'viewer' ? 'selected' : ''}>查看者</option>
                            <option value="editor" ${collab.role === 'editor' ? 'selected' : ''}>编辑者</option>
                        </select>
                        <button class="btn btn-danger" onclick="editor.removeCollaborator(${collab.id})">移除</button>
                    ` : '<span style="color: var(--primary); font-weight: 500;">创建者</span>'}
                </div>
            </div>
        `).join('');
    },
    
    async addCollaborator() {
        const name = document.getElementById('collaborator-name').value.trim();
        const role = document.getElementById('collaborator-role').value;
        
        if (!name) {
            alert('请输入用户名');
            return;
        }
        
        const result = await this.request('add_collaborator', 'POST', {
            survey_id: this.surveyId,
            username: name,
            role: role
        });
        
        if (result.success) {
            document.getElementById('collaborator-name').value = '';
            this.loadCollaborators();
        } else {
            alert(result.message || '添加失败');
        }
    },
    
    async updateCollaboratorRole(collabId, role) {
        const result = await this.request('update_collaborator', 'POST', {
            id: collabId,
            role: role
        });
        
        if (!result.success) {
            alert(result.message || '更新失败');
            this.loadCollaborators();
        }
    },
    
    async removeCollaborator(collabId) {
        if (!confirm('确定要移除该协作成员吗？')) return;
        
        const result = await this.request('remove_collaborator', 'POST', {
            id: collabId
        });
        
        if (result.success) {
            this.loadCollaborators();
        } else {
            alert(result.message || '移除失败');
        }
    },
    
    async showPublishModal() {
        await this.saveAll();
        
        const url = `${API_BASE}?action=get_survey&id=${this.surveyId}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            this.survey = result.data.survey;
            
            const shareUrl = window.location.origin + '/wenjuan/view.php?token=' + this.survey.share_token;
            document.getElementById('share-url').value = shareUrl;
            
            const qrContainer = document.getElementById('qr-code');
            qrContainer.innerHTML = '';
            this.qrCode = new QRCode(qrContainer, {
                text: shareUrl,
                width: 168,
                height: 168,
                correctLevel: QRCode.CorrectLevel.M
            });
        }
        
        document.getElementById('modal-publish').classList.add('active');
    },
    
    async publishSurvey() {
        const result = await this.request('publish_survey', 'POST', {
            id: this.surveyId,
            status: 1
        });
        
        if (result.success) {
            alert('发布成功！');
        }
    },
    
    async unpublishSurvey() {
        if (!confirm('确定要停止回收吗？用户将无法再填写此问卷。')) return;
        
        const result = await this.request('publish_survey', 'POST', {
            id: this.surveyId,
            status: 2
        });
        
        if (result.success) {
            alert('已停止回收');
            document.getElementById('modal-publish').classList.remove('active');
        }
    },
    
    copyShareUrl() {
        const input = document.getElementById('share-url');
        input.select();
        document.execCommand('copy');
        alert('链接已复制到剪贴板！');
    },
    
    showPreview() {
        const container = document.getElementById('preview-container');
        let html = `
            <div class="preview-header">
                <h2>${this.escapeHtml(document.getElementById('survey-title').value || '未命名问卷')}</h2>
                <p>${this.escapeHtml(document.getElementById('survey-description').value || '')}</p>
            </div>
        `;
        
        const pages = {};
        this.questions.forEach(q => {
            if (!pages[q.page_number]) pages[q.page_number] = [];
            pages[q.page_number].push(q);
        });
        
        Object.keys(pages).sort((a, b) => a - b).forEach((pageNum, pageIdx) => {
            const pageQuestions = pages[pageNum].sort((a, b) => a.sort_order - b.sort_order);
            
            html += `
                <div style="padding: 20px; background: #f9fafb; border-radius: 12px; margin-bottom: 16px;">
                    <div style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">第 ${pageNum} 页</div>
                    ${pageQuestions.map(q => this.renderPreviewQuestion(q)).join('')}
                </div>
            `;
        });
        
        container.innerHTML = html;
        document.getElementById('modal-preview').classList.add('active');
    },
    
    renderPreviewQuestion(q) {
        if (q.type === 'paragraph') {
            return `
                <div style="padding: 16px; background: #eef2ff; border-radius: 8px; margin-bottom: 16px;">
                    <div style="font-weight: 600; margin-bottom: 8px;">${this.escapeHtml(q.title)}</div>
                    <div style="color: #6b7280; font-size: 14px;">${this.escapeHtml(q.description || '')}</div>
                </div>
            `;
        }
        
        let inputHtml = '';
        
        if (q.type === 'radio') {
            inputHtml = (q.options || []).map(opt => `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #f9fafb; border-radius: 6px; margin-bottom: 8px;">
                    <div style="width: 18px; height: 18px; border: 2px solid #d1d5db; border-radius: 50%;"></div>
                    <span>${this.escapeHtml(opt.label)}</span>
                </div>
            `).join('');
        } else if (q.type === 'checkbox') {
            inputHtml = (q.options || []).map(opt => `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #f9fafb; border-radius: 6px; margin-bottom: 8px;">
                    <div style="width: 18px; height: 18px; border: 2px solid #d1d5db; border-radius: 4px;"></div>
                    <span>${this.escapeHtml(opt.label)}</span>
                </div>
            `).join('');
        } else if (q.type === 'select') {
            inputHtml = `
                <select style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; background: white;">
                    <option value="">请选择</option>
                    ${(q.options || []).map(opt => `<option value="${opt.value}">${this.escapeHtml(opt.label)}</option>`).join('')}
                </select>
            `;
        } else if (q.type === 'text') {
            inputHtml = '<input type="text" placeholder="请输入" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px;">';
        } else if (q.type === 'textarea') {
            inputHtml = '<textarea placeholder="请输入" rows="3" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; resize: vertical;"></textarea>';
        } else if (q.type === 'rating') {
            const max = q.config?.max || 5;
            inputHtml = `
                <div style="display: flex; gap: 4px;">
                    ${Array(max).fill(0).map(() => '<span style="font-size: 28px; color: #e5e7eb;">★</span>').join('')}
                </div>
            `;
        } else if (q.type === 'date') {
            inputHtml = '<input type="date" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px;">';
        } else if (q.type === 'file') {
            inputHtml = `
                <div style="border: 2px dashed #e5e7eb; border-radius: 8px; padding: 30px; text-align: center; color: #6b7280;">
                    📎 点击或拖拽上传文件
                </div>
            `;
        }
        
        return `
            <div style="margin-bottom: 24px;">
                <div style="font-weight: 500; margin-bottom: 12px;">
                    ${this.escapeHtml(q.title)}
                    ${q.required ? '<span style="color: #ef4444;">*</span>' : ''}
                </div>
                ${q.description ? `<div style="color: #6b7280; font-size: 13px; margin-bottom: 12px;">${this.escapeHtml(q.description)}</div>` : ''}
                ${inputHtml}
            </div>
        `;
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => editor.init());
