const API_BASE = 'api/api.php';

const app = {
    surveys: [],
    
    init() {
        this.bindEvents();
        this.loadSurveys();
    },
    
    bindEvents() {
        document.getElementById('create-survey').addEventListener('click', () => this.createSurvey());
    },
    
    async request(action, method = 'GET', data = null) {
        const url = `${API_BASE}?action=${action}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        return response.json();
    },
    
    async loadSurveys() {
        const result = await this.request('get_surveys');
        if (result.success) {
            this.surveys = result.data;
            this.renderSurveys();
        }
    },
    
    renderSurveys() {
        const container = document.getElementById('survey-list');
        
        if (this.surveys.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <h3>还没有问卷</h3>
                    <p>点击上方按钮创建你的第一个问卷</p>
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
