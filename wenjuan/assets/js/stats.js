const API_BASE = 'api/api.php';

const stats = {
    surveyId: 0,
    survey: null,
    statistics: null,
    responses: [],
    totalResponses: 0,
    currentPage: 1,
    pageSize: 20,
    charts: [],
    
    init() {
        this.surveyId = parseInt(document.getElementById('stats-app').dataset.surveyId);
        this.bindEvents();
        this.loadSurveyInfo();
        this.loadStatistics();
        this.loadResponses();
    },
    
    bindEvents() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
                document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
            });
        });
        
        document.getElementById('export-excel').addEventListener('click', () => {
            window.location.href = `${API_BASE}?action=export_excel&survey_id=${this.surveyId}`;
        });
        
        document.getElementById('export-csv').addEventListener('click', () => {
            window.location.href = `${API_BASE}?action=export_csv&survey_id=${this.surveyId}`;
        });
        
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('modal-detail').classList.remove('active');
        });
        
        document.getElementById('modal-detail').addEventListener('click', (e) => {
            if (e.target.id === 'modal-detail') {
                document.getElementById('modal-detail').classList.remove('active');
            }
        });
    },
    
    async loadSurveyInfo() {
        const url = `${API_BASE}?action=get_survey&id=${this.surveyId}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            this.survey = result.data.survey;
            document.getElementById('survey-title').textContent = result.data.survey.title;
        }
    },
    
    async loadStatistics() {
        const url = `${API_BASE}?action=get_statistics&survey_id=${this.surveyId}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            this.statistics = result.data.statistics;
            this.totalResponses = result.data.total_responses;
            this.renderSummary();
            this.renderCharts();
        }
    },
    
    renderSummary() {
        const container = document.getElementById('stats-summary');
        
        const questionCount = this.survey ? this.statistics.length : 0;
        
        container.innerHTML = `
            <div class="summary-card">
                <div class="label">总回收数</div>
                <div class="value">${this.totalResponses}</div>
            </div>
            <div class="summary-card">
                <div class="label">统计题目数</div>
                <div class="value">${this.statistics.length}</div>
            </div>
        `;
    },
    
    renderCharts() {
        const container = document.getElementById('charts-container');
        
        if (this.statistics.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <h3>暂无统计数据</h3>
                    <p>选择题型的题目才会显示统计图表</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.statistics.map((stat, idx) => {
            const chartType = stat.type === 'rating' ? 'bar' : ['checkbox', 'select'].includes(stat.type) ? 'bar' : 'pie';
            
            return `
                <div class="chart-card">
                    <h3>${this.escapeHtml(stat.question_title)}</h3>
                    <div class="chart-wrapper">
                        <canvas id="chart-${idx}"></canvas>
                    </div>
                    ${stat.average !== undefined ? `
                        <div class="chart-stats">
                            <div class="chart-stat-item">
                                <span class="label">平均分</span>
                                <span class="value">${stat.average}</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        setTimeout(() => {
            this.statistics.forEach((stat, idx) => {
                this.createChart(idx, stat);
            });
        }, 100);
    },
    
    createChart(idx, stat) {
        const canvas = document.getElementById(`chart-${idx}`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const labels = stat.counts.map(c => c.label);
        const data = stat.counts.map(c => c.count);
        const colors = [
            '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
            '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
            '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4'
        ];
        
        const isPie = ['radio', 'checkbox'].includes(stat.type) && stat.counts.length <= 8;
        
        if (isPie) {
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels,
                    datasets: [{
                        data,
                        backgroundColor: colors.slice(0, data.length),
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    const total = data.reduce((a, b) => a + b, 0);
                                    const percent = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                                    return `${ctx.label}: ${ctx.raw} (${percent}%)`;
                                }
                            }
                        }
                    }
                }
            });
        } else {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: '选择人数',
                        data,
                        backgroundColor: stat.type === 'rating' ? '#f59e0b' : '#6366f1',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: stat.counts.length > 5 ? 'y' : 'x',
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    },
    
    async loadResponses() {
        const url = `${API_BASE}?action=get_responses&survey_id=${this.surveyId}&page=${this.currentPage}&page_size=${this.pageSize}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            this.responses = result.data.items;
            this.totalResponses = result.data.total;
            this.renderResponses();
            this.renderPagination();
        }
    },
    
    renderResponses() {
        const container = document.getElementById('responses-list');
        
        if (this.responses.length === 0) {
            container.innerHTML = `
                <div class="empty-list">
                    <div class="icon">📋</div>
                    <h3>暂无答卷</h3>
                    <p>还没有人填写此问卷</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="response-header">
                <div>序号</div>
                <div>提交时间</div>
                <div>IP地址</div>
                <div>操作</div>
            </div>
            ${this.responses.map((resp, idx) => `
                <div class="response-row">
                    <div class="cell" data-label="序号">${(this.currentPage - 1) * this.pageSize + idx + 1}</div>
                    <div class="cell" data-label="提交时间">${resp.submit_time}</div>
                    <div class="cell muted" data-label="IP地址">${resp.ip_address || '-'}</div>
                    <div class="cell" data-label="操作">
                        <button class="view-detail-btn" onclick="stats.viewDetail(${resp.id})">查看详情</button>
                    </div>
                </div>
            `).join('')}
        `;
    },
    
    renderPagination() {
        const totalPages = Math.ceil(this.totalResponses / this.pageSize);
        const container = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let html = `<button ${this.currentPage === 1 ? 'disabled' : ''} onclick="stats.goToPage(${this.currentPage - 1})">上一页</button>`;
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += `<button class="${i === this.currentPage ? 'active' : ''}" onclick="stats.goToPage(${i})">${i}</button>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<button disabled>...</button>';
            }
        }
        
        html += `<button ${this.currentPage === totalPages ? 'disabled' : ''} onclick="stats.goToPage(${this.currentPage + 1})">下一页</button>`;
        
        container.innerHTML = html;
    },
    
    goToPage(page) {
        const totalPages = Math.ceil(this.totalResponses / this.pageSize);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.loadResponses();
    },
    
    async viewDetail(responseId) {
        const url = `${API_BASE}?action=get_response_detail&response_id=${responseId}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            const content = document.getElementById('detail-content');
            content.innerHTML = `
                <div class="detail-question">
                    <div class="q-title">提交时间</div>
                    <div class="q-answer">${result.data.response.submit_time}</div>
                </div>
                <div class="detail-question">
                    <div class="q-title">IP地址</div>
                    <div class="q-answer">${result.data.response.ip_address || '-'}</div>
                </div>
                ${result.data.answers.map(a => {
                    let answerText = a.answer_value;
                    
                    if (a.type === 'checkbox') {
                        try {
                            const arr = JSON.parse(a.answer_value);
                            answerText = Array.isArray(arr) ? arr.join(', ') : a.answer_value;
                        } catch (e) {
                            answerText = a.answer_value;
                        }
                    }
                    
                    if (a.type === 'rating') {
                        answerText = a.answer_value + ' 分';
                    }
                    
                    const isLong = answerText && answerText.length > 50;
                    
                    return `
                        <div class="detail-question">
                            <div class="q-title">${this.escapeHtml(a.title)}</div>
                            <div class="q-answer ${isLong ? 'text-long' : ''}">${answerText || '（未填写）'}</div>
                        </div>
                    `;
                }).join('')}
            `;
            
            document.getElementById('modal-detail').classList.add('active');
        }
    },
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => stats.init());
