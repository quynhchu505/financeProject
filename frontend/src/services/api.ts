const API_BASE = '/api/v1';

type TokenPayload = {
  access_token: string;
  refresh_token?: string;
};

class ApiService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && retry && this.refreshToken && !endpoint.startsWith('/auth/')) {
      try {
        await this.refreshAccessToken();
        return this.request<T>(endpoint, options, false);
      } catch {
        this.clearToken();
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  private setTokens(payload: TokenPayload) {
    this.token = payload.access_token;
    localStorage.setItem('token', payload.access_token);
    if (payload.refresh_token) {
      this.refreshToken = payload.refresh_token;
      localStorage.setItem('refresh_token', payload.refresh_token);
    }
  }

  private async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('Missing refresh token');
    }
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    this.refreshPromise = (async () => {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });
      if (!response.ok) {
        throw new Error('Refresh failed');
      }
      const data = await response.json() as TokenPayload;
      this.setTokens(data);
    })();
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  clearToken() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated() {
    return !!this.token;
  }

  async register(email: string, password: string, name: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    const data = await this.request<TokenPayload>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setTokens(data);
    return data;
  }

  async logout() {
    if (this.refreshToken) {
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      }).catch(() => undefined);
    }
    this.clearToken();
  }

  async logoutAll() {
    await this.request('/auth/logout-all', { method: 'POST' });
    this.clearToken();
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async getAccounts() {
    return this.request<any[]>('/accounts/');
  }

  async createAccount(data: { name: string; account_type: string; currency?: string; icon?: string }) {
    return this.request('/accounts/', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateAccount(id: number, data: Partial<{ name: string; currency: string; icon: string; account_type: string }>) {
    return this.request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteAccount(id: number) {
    return this.request(`/accounts/${id}`, { method: 'DELETE' });
  }

  async transfer(data: { from_account_id: number; to_account_id: number; amount: number; description?: string; date: string }) {
    return this.request('/accounts/transfer', { method: 'POST', body: JSON.stringify(data) });
  }

  async getCategories() {
    return this.request<any[]>('/categories/');
  }

  async initDefaultCategories() {
    return this.request('/categories/init-default', { method: 'POST' });
  }

  async createCategory(data: { name: string; icon?: string; color?: string; parent_id?: number }) {
    return this.request('/categories/', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteCategory(id: number) {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  async getTransactions(params?: {
    account_id?: number;
    category_id?: number;
    start_date?: string;
    end_date?: string;
    q?: string;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_dir?: string;
    transaction_type?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') {
          searchParams.set(k, String(v));
        }
      });
    }
    const qs = searchParams.toString();
    return this.request<any>(`/transactions/${qs ? '?' + qs : ''}`);
  }

  async getTransaction(id: number) {
    return this.request<any>(`/transactions/${id}`);
  }

  async createTransaction(data: {
    account_id: number;
    category_id?: number;
    amount: number;
    transaction_type: string;
    description?: string;
    date: string;
    is_ai_categorized?: boolean;
    ai_confidence?: number;
  }) {
    return this.request('/transactions/', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateTransaction(id: number, data: Partial<{
    account_id: number;
    category_id: number | null;
    amount: number;
    transaction_type: string;
    description: string;
    date: string;
  }>) {
    return this.request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteTransaction(id: number) {
    return this.request(`/transactions/${id}`, { method: 'DELETE' });
  }

  async getBudgets() {
    return this.request<any[]>('/budgets/');
  }

  async createBudget(data: { category_id: number; amount: number; period?: string }) {
    return this.request('/budgets/', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateBudget(id: number, data: Partial<{ amount: number; period: string }>) {
    return this.request(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteBudget(id: number, password: string) {
    const formData = new FormData();
    formData.append('password', password);
    return this.request(`/budgets/${id}`, { method: 'DELETE', body: formData });
  }

  async getDashboardStats() {
    return this.request<any>('/dashboard/stats');
  }

  async getMonthlyReports(months?: number) {
    return this.request<any[]>(`/reports/monthly?months=${months || 6}`);
  }

  async exportReport(format: 'csv' | 'pdf', months?: number) {
    const response = await fetch(`${API_BASE}/reports/export/${format}?months=${months || 6}`, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    });
    if (!response.ok) {
      throw new Error('Export failed');
    }
    return response.blob();
  }

  async categorizeTransaction(description: string, amount?: number) {
    return this.request<any>(`/ai/categorize`, {
      method: 'POST',
      body: JSON.stringify({ description, amount }),
    });
  }

  async sendClassifierFeedback(data: {
    description: string;
    predicted_category_id?: number;
    actual_category_id: number;
    transaction_id?: number;
  }) {
    return this.request('/ai/classifier-feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCashFlowPrediction(months?: number) {
    return this.request<any[]>(`/ai/predict-cashflow?months=${months || 3}`);
  }

  async scanAnomalies() {
    return this.request<any[]>('/ai/anomaly-scan', { method: 'POST' });
  }

  async getAnomalyAlerts() {
    return this.request<any[]>('/ai/anomaly-alerts');
  }

  async sendAnomalyFeedback(alertId: number, verdict: 'normal' | 'investigate') {
    return this.request('/ai/anomaly-feedback', {
      method: 'POST',
      body: JSON.stringify({ alert_id: alertId, verdict }),
    });
  }

  async getAlerts(unreadOnly = false) {
    return this.request<any[]>(`/alerts/?unread_only=${unreadOnly}`);
  }

  async markAlertRead(id: number) {
    return this.request<any>(`/alerts/${id}/read`, { method: 'POST' });
  }

  async chat(message: string, sessionId?: number) {
    return this.request<{ response: string; sources?: string[]; session_id?: number }>('/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId }),
    });
  }

  async getChatSessions() {
    return this.request<any[]>('/chatbot/sessions/');
  }

  async createChatSession(title?: string) {
    return this.request<any>('/chatbot/sessions/', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async getChatSession(id: number) {
    return this.request<any>(`/chatbot/sessions/${id}`);
  }

  async deleteChatSession(id: number) {
    return this.request<void>(`/chatbot/sessions/${id}`, { method: 'DELETE' });
  }

  async updateChatSession(id: number, title: string) {
    return this.request<any>(`/chatbot/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  }
}

export const api = new ApiService();
