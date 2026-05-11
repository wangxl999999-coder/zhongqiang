const API_BASE = 'api/api.php';
const AUTH_API = 'api/auth.php';

const app = {
    surveys: [],
    templates: [],
    currentCategory: 'all',
    currentTemplate: null,
    user: null,
    authToken: null,
    
    async init() {
        this.authToken = localStorage.getItem('auth_token');
        if (this.authToken) {
            await this.loadUserInfo();
        }
        this.renderUserMenu();
        this.bindEvents();
        this.loadSurveys();
    },
    
    bindEvents() {
        document.getElementById('create-survey').addEventListener('click', () => this.createSurvey());
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });
        
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentCategory = e.target.dataset.category;
                this.filterTemplates();
            });
        });
        
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('user-dropdown');
            if (dropdown && !e.target.closest('.dropdown')) {
                dropdown.classList.remove('active');
            }
        });
        
        const avatarPreview = document.getElementById('profile-avatar');
        if (avatarPreview) {
            avatarPreview.addEventListener('click', () => {
                document.getElementById('avatar-input').click();
            });
        }
        
        const avatarInput = document.getElementById('avatar-input');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => this.handleAvatarUpload(e));
        }
        
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').classList.remove('active');
            });
        });
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    switchView(viewName) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });
        
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === `view-${viewName}`);
        });
        
        if (viewName === 'templates' && this.templates.length === 0) {
            this.loadTemplates();
        }
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
    
    async loadUserInfo() {
        const result = await this.request('get_user', 'GET', null, null, true);
        if (result.success) {
            this.user = result.data;
            localStorage.setItem('user_info', JSON.stringify(this.user));
        } else {
            this.authToken = null;
            this.user = null;
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_info');
        }
    },
    
    renderUserMenu() {
        const container = document.getElementById('user-menu');
        if (!container) return;
        
        if (this.user) {
            const avatarText = (this.user.nickname || this.user.username || 'U').charAt(0).toUpperCase();
            const avatarHtml = this.user.avatar_url 
                ? `<img src="${this.user.avatar_url}" alt="头像">`
                : avatarText;
            
            container.innerHTML = `
                <div class="dropdown">
                    <div class="user-info" onclick="app.toggleUserDropdown()">
                        <div class="user-avatar">${avatarHtml}</div>
                        <span class="user-name">${this.escapeHtml(this.user.nickname || this.user.username)}</span>
                        <span style="color: var(--text-muted); font-size: 12px;">▼</span>
                    </div>
                    <div class="dropdown-menu" id="user-dropdown">
                        <div class="dropdown-item" onclick="app.openProfileModal()">
                            <span>👤</span> 个人资料
                        </div>
                        <div class="dropdown-item" onclick="app.openPasswordModal()">
                            <span>🔐</span> 修改密码
                        </div>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-item danger" onclick="app.logout()">
                            <span>🚪</span> 退出登录
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <button class="btn-login" onclick="app.goToLogin()">登录 / 注册</button>
            `;
        }
    },
    
    toggleUserDropdown() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    },
    
    goToLogin() {
        location.href = 'login.php?redirect=' + encodeURIComponent(location.pathname + location.search);
    },
    
    async logout() {
        await this.request('logout', 'POST', null, null, true);
        this.authToken = null;
        this.user = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        this.renderUserMenu();
        this.loadSurveys();
    },
    
    openProfileModal() {
        if (!this.user) return;
        
        const modal = document.getElementById('modal-profile');
        const avatarPreview = document.getElementById('profile-avatar');
        const avatarText = (this.user.nickname || this.user.username || 'U').charAt(0).toUpperCase();
        
        if (this.user.avatar_url) {
            avatarPreview.innerHTML = `<img src="${this.user.avatar_url}?t=${Date.now()}" alt="头像">`;
        } else {
            avatarPreview.innerHTML = avatarText;
        }
        
        document.getElementById('profile-nickname').value = this.user.nickname || '';
        document.getElementById('profile-email').value = this.user.email || '';
        document.getElementById('profile-phone').value = this.user.phone || '未绑定';
        
        document.getElementById('user-dropdown').classList.remove('active');
        modal.classList.add('active');
    },
    
    closeProfileModal() {
        document.getElementById('modal-profile').classList.remove('active');
    },
    
    openPasswordModal() {
        document.getElementById('user-dropdown').classList.remove('active');
        document.getElementById('pwd-old').value = '';
        document.getElementById('pwd-new').value = '';
        document.getElementById('pwd-confirm').value = '';
        document.getElementById('modal-password').classList.add('active');
    },
    
    closePasswordModal() {
        document.getElementById('modal-password').classList.remove('active');
    },
    
    async saveProfile() {
        const nickname = document.getElementById('profile-nickname').value.trim();
        const email = document.getElementById('profile-email').value.trim();
        
        if (!nickname) {
            alert('昵称不能为空');
            return;
        }
        
        const result = await this.request('update_profile', 'POST', {
            nickname,
            email
        }, null, true);
        
        if (result.success) {
            this.user = result.data;
            localStorage.setItem('user_info', JSON.stringify(this.user));
            this.renderUserMenu();
            this.closeProfileModal();
            alert('保存成功');
        } else {
            alert(result.message || '保存失败');
        }
    },
    
    async handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            alert('只支持 JPG/PNG/GIF 格式');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            alert('图片大小不能超过 2MB');
            return;
        }
        
        const formData = new FormData();
        formData.append('avatar', file);
        
        const result = await this.request('update_avatar', 'POST', formData, null, true);
        
        if (result.success) {
            this.user.avatar = result.data.avatar;
            this.user.avatar_url = result.data.avatar_url;
            localStorage.setItem('user_info', JSON.stringify(this.user));
            
            const avatarPreview = document.getElementById('profile-avatar');
            avatarPreview.innerHTML = `<img src="${result.data.avatar_url}?t=${Date.now()}" alt="头像">`;
            
            this.renderUserMenu();
            alert('头像更新成功');
        } else {
            alert(result.message || '上传失败');
        }
        
        e.target.value = '';
    },
    
    async changePassword() {
        const oldPwd = document.getElementById('pwd-old').value;
        const newPwd = document.getElementById('pwd-new').value;
        const confirmPwd = document.getElementById('pwd-confirm').value;
        
        if (!oldPwd || !newPwd || !confirmPwd) {
            alert('请填写完整信息');
            return;
        }
        
        if (newPwd.length < 6) {
            alert('新密码长度至少6位');
            return;
        }
        
        if (newPwd !== confirmPwd) {
            alert('两次输入的新密码不一致');
            return;
        }
        
        const result = await this.request('update_password', 'POST', {
            old_password: oldPwd,
            new_password: newPwd
        }, null, true);
        
        if (result.success) {
            alert('密码修改成功');
            this.closePasswordModal();
        } else {
            alert(result.message || '修改失败');
        }
    },
    
    async loadSurveys() {
        const result = await this.request('get_surveys');
        if (result.success) {
            this.surveys = result.data;
            this.renderSurveys();
        }
    },
    
    async loadTemplates() {
        const result = await this.request('get_templates');
        if (result.success) {
            this.templates = result.data;
            this.renderTemplates();
        }
    },
    
    renderSurveys() {
        const container = document.getElementById('survey-list');
        
        if (this.surveys.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <h3>还没有问卷</h3>
                    <p>点击上方按钮创建你的第一个问卷，或从模板市场选择一个模板</p>
                    <button class="btn btn-primary" style="margin-top: 20px;" onclick="app.switchView('templates')">浏览模板</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.surveys.map(survey => {
            const statusMap = {
                0: { text: '草稿', class: 'status-draft' },
                1: { text: '收集中', class: 'status-publish' },
                2: { text: '已结束', class: 'status-end' }
            };
            const status = statusMap[survey.status] || statusMap[0];
            
            return `
                <div class="survey-card" data-id="${survey.id}">
                    <div class="survey-info">
                        <div class="survey-title">${this.escapeHtml(survey.title)}</div>
                        <div class="survey-meta">
                            <span class="survey-status ${status.class}">${status.text}</span>
                            <span>${survey.question_count} 题</span>
                            <span>${survey.response_count} 份答卷</span>
                            <span>创建于 ${survey.created_at?.substring(0, 10) || '未知'}</span>
                        </div>
                    </div>
                    <div class="survey-actions">
                        <button class="btn" onclick="app.editSurvey(${survey.id})">编辑</button>
                        <button class="btn" onclick="app.viewStats(${survey.id})">统计</button>
                        <button class="btn btn-danger" onclick="app.deleteSurvey(${survey.id})">删除</button>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    renderTemplates() {
        const container = document.getElementById('template-list');
        const filtered = this.currentCategory === 'all' 
            ? this.templates 
            : this.templates.filter(t => t.category === this.currentCategory);
        
        const categoryNames = {
            satisfaction: '满意度',
            survey: '报名表',
            quiz: '测验',
            other: '其他'
        };
        
        const categoryIcons = {
            satisfaction: '😊',
            survey: '📝',
            quiz: '📚',
            other: '📋'
        };
        
        container.innerHTML = filtered.map(template => `
            <div class="template-card" data-id="${template.id}" onclick="app.previewTemplate(${template.id})">
                <div class="template-icon">${categoryIcons[template.category] || '📋'}</div>
                <div class="template-category">${categoryNames[template.category] || '其他'}</div>
                <div class="template-title">${this.escapeHtml(template.title)}</div>
                <div class="template-description">${this.escapeHtml(template.description || '')}</div>
                <div class="template-footer">
                    <span>使用 ${template.usage_count || 0} 次</span>
                    <span class="template-use-btn">使用模板</span>
                </div>
            </div>
        `).join('');
    },
    
    filterTemplates() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === this.currentCategory);
        });
        this.renderTemplates();
    },
    
    async previewTemplate(templateId) {
        const result = await this.request('get_template', 'GET', null, { id: templateId });
        if (result.success) {
            this.currentTemplate = result.data;
            this.showTemplatePreview();
        }
    },
    
    showTemplatePreview() {
        const template = this.currentTemplate;
        const previewContent = document.getElementById('preview-content');
        const previewTitle = document.getElementById('preview-title');
        
        previewTitle.textContent = template.title;
        
        let questionsHtml = '';
        try {
            const templateData = JSON.parse(template.template_data);
            const questions = templateData.questions || [];
            
            questionsHtml = questions.map((q, idx) => `
                <div class="preview-question">
                    <div class="preview-q-number">Q${idx + 1}</div>
                    <div class="preview-q-title">${this.escapeHtml(q.title)}</div>
                    <div class="preview-q-type">类型：${this.getQuestionTypeName(q.type)}</div>
                </div>
            `).join('');
        } catch (e) {
            questionsHtml = '<p>模板预览加载失败</p>';
        }
        
        previewContent.innerHTML = `
            <div class="preview-description">
                ${this.escapeHtml(template.description || '')}
            </div>
            <div class="preview-questions">
                ${questionsHtml}
            </div>
        `;
        
        document.getElementById('use-template-btn').onclick = () => this.useCurrentTemplate();
        document.getElementById('modal-template-preview').classList.add('active');
    },
    
    getQuestionTypeName(type) {
        const types = {
            text: '单行文本',
            textarea: '多行文本',
            radio: '单选题',
            checkbox: '多选题',
            select: '下拉选择',
            rating: '评分',
            date: '日期',
            file: '文件上传',
            paragraph: '段落说明'
        };
        return types[type] || type;
    },
    
    closeTemplatePreview() {
        document.getElementById('modal-template-preview').classList.remove('active');
    },
    
    async useCurrentTemplate() {
        if (!this.currentTemplate) return;
        
        const result = await this.request('create_from_template', 'POST', {
            template_id: this.currentTemplate.id
        });
        
        if (result.success) {
            this.closeTemplatePreview();
            location.href = `editor.php?id=${result.data.id}`;
        } else {
            alert(result.message || '创建失败');
        }
    },
    
    async createSurvey() {
        const result = await this.request('create_survey', 'POST', {
            title: '未命名问卷'
        });
        
        if (result.success) {
            location.href = `editor.php?id=${result.data.id}`;
        }
    },
    
    editSurvey(id) {
        location.href = `editor.php?id=${id}`;
    },
    
    viewStats(id) {
        location.href = `stats.php?id=${id}`;
    },
    
    async deleteSurvey(id) {
        if (!confirm('确定要删除这个问卷吗？此操作不可恢复。')) {
            return;
        }
        
        const result = await this.request('delete_survey', 'POST', { id });
        if (result.success) {
            this.loadSurveys();
        }
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
