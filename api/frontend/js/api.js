const API_BASE = 'http://localhost:8000';

const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || '请求失败');
        }
        
        return data;
    },
    
    async register(username, email, password, referralCode = '') {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username,
                email,
                password,
                referral_code: referralCode || null
            })
        });
    },
    
    async login(username, password) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },
    
    async getProfile() {
        return this.request('/api/user/profile');
    },
    
    async regenerateApiKey() {
        return this.request('/api/user/regenerate-api-key', {
            method: 'POST'
        });
    },
    
    async recharge(amount) {
        return this.request('/api/user/recharge', {
            method: 'POST',
            body: JSON.stringify({ amount })
        });
    },
    
    async getPromotion() {
        return this.request('/api/user/promotion');
    },
    
    async getStatistics() {
        return this.request('/api/user/statistics');
    },
    
    async getPurchaseList(limit = 20, offset = 0) {
        return this.request(`/api/user/purchase-list?limit=${limit}&offset=${offset}`);
    },
    
    async getConsumptionList(limit = 20, offset = 0) {
        return this.request(`/api/user/consumption-list?limit=${limit}&offset=${offset}`);
    },
    
    async testApi(apiKey) {
        const response = await fetch(`${API_BASE}/api/v1/test`, {
            headers: {
                'X-API-Key': apiKey
            }
        });
        return response.json();
    },
    
    async getTaobaoDetail(apiKey, url, cookies = '') {
        let endpoint = `${API_BASE}/api/v1/taobao/detail?url=${encodeURIComponent(url)}`;
        if (cookies) {
            endpoint += `&cookies=${encodeURIComponent(cookies)}`;
        }
        const response = await fetch(endpoint, {
            headers: {
                'X-API-Key': apiKey
            }
        });
        return response.json();
    },
    
    async getTmallDetail(apiKey, url, cookies = '') {
        let endpoint = `${API_BASE}/api/v1/tmall/detail?url=${encodeURIComponent(url)}`;
        if (cookies) {
            endpoint += `&cookies=${encodeURIComponent(cookies)}`;
        }
        const response = await fetch(endpoint, {
            headers: {
                'X-API-Key': apiKey
            }
        });
        return response.json();
    }
};

const auth = {
    saveSession(data) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
    },
    
    clearSession() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    
    getToken() {
        return localStorage.getItem('token');
    },
    
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    
    isLoggedIn() {
        return !!this.getToken();
    },
    
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },
    
    redirectIfLoggedIn() {
        if (this.isLoggedIn()) {
            window.location.href = 'dashboard.html';
        }
    }
};
