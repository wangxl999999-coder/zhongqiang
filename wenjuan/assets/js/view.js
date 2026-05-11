const API_BASE = 'api/api.php';

const viewer = {
    token: '',
    survey: null,
    questions: [],
    conditions: [],
    answers: {},
    currentPage: 1,
    totalPages: 1,
    passwordVerified: false,
    timer: null,
    remainingSeconds: 0,
    timerStarted: false,
    
    init() {
        this.token = document.getElementById('view-app').dataset.token;
        this.loadSurvey();
    },
    
    async request(action, method = 'GET', data = null) {
        const url = `${API_BASE}?action=${action}`;
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data) options.body = JSON.stringify(data);
        const response = await fetch(url, options);
        return response.json();
    },
    
    async loadSurvey() {
        const url = `${API_BASE}?action=get_public_survey&token=${this.token}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (!result.success) {
            this.showError(result.message);
            return;
        }
        
        this.survey = result.data.survey;
        this.questions = result.data.questions;
        this.conditions = result.data.conditions;
        
        this.totalPages = this.questions.length > 0 
            ? Math.max(...this.questions.map(q => q.page_number)) 
            : 1;
        
        if (this.survey.has_password) {
            this.showPasswordModal();
        } else {
            this.renderSurvey();
        }
    },
    
    showPasswordModal() {
        const modal = document.getElementById('modal-password');
        modal.classList.add('active');
        
        document.getElementById('submit-password').addEventListener('click', async () => {
            const password = document.getElementById('access-password').value;
            const result = await this.request('verify_password', 'POST', {
                token: this.token,
                password
            });
            
            if (result.success) {
                this.passwordVerified = true;
                modal.classList.remove('active');
                this.renderSurvey();
            } else {
                alert(result.message);
            }
        });
    },
    
    showError(message) {
        document.getElementById('survey-content').innerHTML = `
            <div class="error-view">
                <div class="error-icon">⚠️</div>
                <h3>无法访问问卷</h3>
                <p>${message}</p>
            </div>
        `;
    },
    
    startTimer() {
        if (this.timerStarted || !this.survey.time_limit) return;
        
        this.timerStarted = true;
        this.remainingSeconds = this.survey.time_limit * 60;
        
        this.request('start_timer', 'POST', {
            survey_id: this.survey.id,
            time_limit: this.survey.time_limit
        });
        
        this.timer = setInterval(() => {
            this.remainingSeconds--;
            this.updateTimerDisplay();
            
            if (this.remainingSeconds <= 0) {
                this.timeUp();
            }
        }, 1000);
        
        this.updateTimerDisplay();
    },
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.remainingSeconds / 60);
        const seconds = this.remainingSeconds % 60;
        const timerEl = document.getElementById('timer-display');
        
        if (timerEl) {
            timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            if (this.remainingSeconds <= 60) {
                timerEl.classList.add('timer-warning');
            }
            if (this.remainingSeconds <= 30) {
                timerEl.classList.add('timer-danger');
            }
        }
    },
    
    async timeUp() {
        clearInterval(this.timer);
        
        await this.request('submit_response', 'POST', {
            survey_id: this.survey.id,
            answers: this.answers,
            auto_submit: true
        });
        
        document.getElementById('modal-timeup').classList.add('active');
    },
    
    renderSurvey() {
        const container = document.getElementById('survey-content');
        
        let timerHtml = '';
        if (this.survey.time_limit) {
            timerHtml = `
                <div class="timer-bar">
                    <div class="timer-info">
                        <span class="timer-icon">⏱️</span>
                        <span class="timer-label">剩余时间：</span>
                        <span class="timer-value" id="timer-display">${this.survey.time_limit}:00</span>
                    </div>
                </div>
            `;
        }
        
        let html = `
            <div class="survey-header">
                <h1>${this.escapeHtml(this.survey.title)}</h1>
                ${this.survey.description ? `<p>${this.escapeHtml(this.survey.description)}</p>` : ''}
            </div>
            ${timerHtml}
            <div class="survey-content">
        `;
        
        if (this.totalPages > 1) {
            html += `
                <div class="page-indicator">
                    ${Array(this.totalPages).fill(0).map((_, i) => `
                        <div class="page-dot ${i + 1 === this.currentPage ? 'active' : ''}" data-page="${i + 1}"></div>
                    `).join('')}
                </div>
            `;
        }
        
        for (let p = 1; p <= this.totalPages; p++) {
            const pageQuestions = this.questions.filter(q => q.page_number === p).sort((a, b) => a.sort_order - b.sort_order);
            
            html += `<div class="page-section ${p === this.currentPage ? 'active' : ''}" data-page="${p}">`;
            
            pageQuestions.forEach((q, idx) => {
                html += this.renderQuestion(q, idx);
            });
            
            html += `
                <div class="navigation-buttons">
                    ${p > 1 ? `<button class="btn" onclick="viewer.goToPage(${p - 1})">上一页</button>` : ''}
                    ${p === this.totalPages ? `<button class="btn btn-primary" onclick="viewer.submit()">提交</button>` : `<button class="btn btn-primary" onclick="viewer.goToPage(${p + 1})">下一页</button>`}
                </div>
            `;
            
            html += '</div>';
        }
        
        html += '</div>';
        
        container.innerHTML = html;
        this.bindQuestionEvents();
        
        if (this.survey.time_limit) {
            this.startTimer();
        }
    },
    
    renderQuestion(q, idx) {
        if (q.type === 'paragraph') {
            return `
                <div class="question-view paragraph-view">
                    <div class="question-title">${this.escapeHtml(q.title)}</div>
                    ${q.description ? `<div class="question-description">${this.escapeHtml(q.description)}</div>` : ''}
                </div>
            `;
        }
        
        let inputHtml = '';
        
        if (q.type === 'radio') {
            inputHtml = `
                <div class="options-view">
                    ${(q.options || []).map(opt => `
                        <div class="option-view" data-value="${opt.value}" data-qid="${q.id}">
                            <div class="option-radio"></div>
                            <div class="option-label">${this.escapeHtml(opt.label)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (q.type === 'checkbox') {
            inputHtml = `
                <div class="options-view">
                    ${(q.options || []).map(opt => `
                        <div class="option-view" data-value="${opt.value}" data-qid="${q.id}">
                            <div class="option-checkbox"></div>
                            <div class="option-label">${this.escapeHtml(opt.label)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (q.type === 'select') {
            inputHtml = `
                <select class="input-select" data-qid="${q.id}">
                    <option value="">请选择</option>
                    ${(q.options || []).map(opt => `
                        <option value="${opt.value}">${this.escapeHtml(opt.label)}</option>
                    `).join('')}
                </select>
            `;
        } else if (q.type === 'text') {
            inputHtml = `<input type="text" class="input-text" data-qid="${q.id}" placeholder="请输入">`;
        } else if (q.type === 'textarea') {
            inputHtml = `<textarea class="input-textarea" data-qid="${q.id}" placeholder="请输入"></textarea>`;
        } else if (q.type === 'rating') {
            const max = q.config?.max || 5;
            const min = q.config?.min || 1;
            inputHtml = `
                <div class="rating-view" data-qid="${q.id}" data-max="${max}" data-min="${min}">
                    ${Array(max).fill(0).map((_, i) => `
                        <span class="rating-star" data-value="${min + i}">★</span>
                    `).join('')}
                </div>
            `;
        } else if (q.type === 'date') {
            inputHtml = `<input type="date" class="input-date" data-qid="${q.id}">`;
        } else if (q.type === 'file') {
            inputHtml = `
                <div class="file-upload" data-qid="${q.id}">
                    <input type="file" id="file-${q.id}">
                    <label for="file-${q.id}">
                        <div class="file-upload-icon">📎</div>
                        <div class="file-upload-text">点击上传文件</div>
                    </label>
                </div>
            `;
        }
        
        return `
            <div class="question-view" data-qid="${q.id}" data-type="${q.type}" data-required="${q.required}">
                <div class="question-number">Q${idx + 1}</div>
                <div class="question-title">
                    ${this.escapeHtml(q.title)}
                    ${q.required ? '<span class="required-mark">*</span>' : ''}
                </div>
                ${q.description ? `<div class="question-description">${this.escapeHtml(q.description)}</div>` : ''}
                ${inputHtml}
                <div class="error-message" style="display: none;"></div>
            </div>
        `;
    },
    
    bindQuestionEvents() {
        document.querySelectorAll('.option-view').forEach(opt => {
            opt.addEventListener('click', () => {
                const qid = opt.dataset.qid;
                const value = opt.dataset.value;
                const questionEl = opt.closest('.question-view');
                
                if (questionEl.dataset.type === 'radio') {
                    questionEl.querySelectorAll('.option-view').forEach(o => o.classList.remove('selected'));
                    opt.classList.add('selected');
                    this.answers[qid] = value;
                } else if (questionEl.dataset.type === 'checkbox') {
                    opt.classList.toggle('selected');
                    const selected = questionEl.querySelectorAll('.option-view.selected');
                    this.answers[qid] = Array.from(selected).map(o => o.dataset.value);
                }
                
                this.checkConditions(qid, value);
            });
        });
        
        document.querySelectorAll('.input-select, .input-text, .input-textarea, .input-date').forEach(input => {
            input.addEventListener('change', () => {
                this.answers[input.dataset.qid] = input.value;
            });
        });
        
        document.querySelectorAll('.rating-view').forEach(rating => {
            const qid = rating.dataset.qid;
            const stars = rating.querySelectorAll('.rating-star');
            
            stars.forEach(star => {
                star.addEventListener('click', () => {
                    const value = parseInt(star.dataset.value);
                    stars.forEach((s, i) => {
                        s.classList.toggle('active', parseInt(s.dataset.value) <= value);
                    });
                    this.answers[qid] = value;
                });
                
                star.addEventListener('mouseenter', () => {
                    const value = parseInt(star.dataset.value);
                    stars.forEach((s, i) => {
                        s.classList.toggle('active', parseInt(s.dataset.value) <= value);
                    });
                });
            });
            
            rating.addEventListener('mouseleave', () => {
                const currentValue = this.answers[qid];
                stars.forEach(s => {
                    s.classList.toggle('active', parseInt(s.dataset.value) <= currentValue);
                });
            });
        });
    },
    
    checkConditions(triggerQid, value) {
        const conditions = this.conditions.filter(c => c.trigger_question_id === triggerQid);
        
        conditions.forEach(cond => {
            if (cond.trigger_option_value === value || cond.trigger_option_value === '') {
                if (cond.action === 'jump') {
                    if (cond.target_question_id) {
                        const targetQ = this.questions.find(q => q.id === cond.target_question_id);
                        if (targetQ) {
                            this.goToPage(targetQ.page_number);
                        }
                    }
                } else if (cond.action === 'show' || cond.action === 'hide') {
                    const targetEl = document.querySelector(`.question-view[data-qid="${cond.target_question_id}"]`);
                    if (targetEl) {
                        targetEl.classList.toggle('hidden', cond.action === 'hide');
                    }
                }
            }
        });
    },
    
    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        
        const currentPageEl = document.querySelector(`.page-section[data-page="${this.currentPage}"]`);
        if (currentPageEl && page > this.currentPage) {
            const visibleQuestions = currentPageEl.querySelectorAll('.question-view:not(.hidden)');
            for (const qEl of visibleQuestions) {
                if (qEl.dataset.required === 'true' && !this.validateQuestion(qEl)) {
                    return;
                }
            }
        }
        
        this.currentPage = page;
        
        document.querySelectorAll('.page-section').forEach(p => {
            p.classList.toggle('active', parseInt(p.dataset.page) === page);
        });
        
        document.querySelectorAll('.page-dot').forEach(dot => {
            dot.classList.toggle('active', parseInt(dot.dataset.page) === page);
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    validateQuestion(qEl) {
        const qid = qEl.dataset.qid;
        const type = qEl.dataset.type;
        const value = this.answers[qid];
        const errorEl = qEl.querySelector('.error-message');
        
        let valid = true;
        
        if (type === 'checkbox') {
            valid = Array.isArray(value) && value.length > 0;
        } else if (type === 'rating') {
            valid = typeof value === 'number';
        } else {
            valid = value !== undefined && value !== '' && value !== null;
        }
        
        if (!valid) {
            qEl.querySelectorAll('.input-text, .input-textarea, .input-select, .input-date').forEach(input => {
                input.classList.add('question-error');
            });
            errorEl.textContent = '请填写此题';
            errorEl.style.display = 'flex';
            qEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            qEl.querySelectorAll('.input-text, .input-textarea, .input-select, .input-date').forEach(input => {
                input.classList.remove('question-error');
            });
            errorEl.style.display = 'none';
        }
        
        return valid;
    },
    
    async submit() {
        const allQuestions = document.querySelectorAll('.question-view:not(.hidden)');
        for (const qEl of allQuestions) {
            if (qEl.dataset.required === 'true' && !this.validateQuestion(qEl)) {
                return;
            }
        }
        
        const result = await this.request('submit_response', 'POST', {
            survey_id: this.survey.id,
            answers: this.answers
        });
        
        if (result.success) {
            document.getElementById('modal-success').classList.add('active');
        } else {
            alert(result.message || '提交失败');
        }
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => viewer.init());
