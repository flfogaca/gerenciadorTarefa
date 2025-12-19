import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { normalizeApiResponse } from '../utils/apiResponse';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn('VITE_API_BASE_URL não está definida. Usando URL padrão:', API_BASE_URL);
} else {
  console.log('API Base URL configurada:', API_BASE_URL);
}

class ApiService {
  private api: AxiosInstance;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem('authToken');
        const tenantId = localStorage.getItem('tenantId');
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (tenantId) {
          config.headers['X-Tenant-ID'] = tenantId;
        }
        
        if (config._skipLogout) {
          config._skipLogout = true;
        }
        
        if (config._isCheckAuth) {
          config._isCheckAuth = true;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 429) {
          if (originalRequest._retry429) {
            return Promise.reject(error);
          }
          
          originalRequest._retry429 = true;
          const retryAfter = parseInt(error.response.headers['retry-after'] || '5', 10);
          const delay = Math.min(retryAfter * 1000, 10000);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.api(originalRequest);
        }
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const requestConfig = originalRequest.config || originalRequest;
          const requestUrl = originalRequest.url || requestConfig?.url || '';
          const isCheckAuthRequest = 
            requestUrl?.includes('/users/me') || 
            (originalRequest as any)?._isCheckAuth ||
            (requestConfig as any)?._isCheckAuth;
          
          if (isCheckAuthRequest) {
            return Promise.reject(error);
          }
          
          const refreshToken = localStorage.getItem('refreshToken');
          const tenantId = localStorage.getItem('tenantId') || 'default-tenant';
          if (refreshToken) {
            try {
              const res = await this.api.post('/users/auth/refresh', {}, {
                headers: { 'X-Refresh-Token': refreshToken, 'X-Tenant-ID': tenantId },
                _isCheckAuth: false
              });
              const newToken = res.data?.data?.token;
              if (newToken) {
                localStorage.setItem('authToken', newToken);
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
                return this.api(originalRequest);
              }
            } catch (e: any) {
              const eStatus = e?.response?.status || e?.status;
              if (eStatus === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('tenantId');
              }
              return Promise.reject(e);
            }
          } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tenantId');
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string, tenantId: string = 'default-tenant') {
    try {
      const url = `${API_BASE_URL}/users/auth/login`;
      console.log('Tentando fazer login em:', url);
      
      const response = await this.api.post('/users/auth/login', {
        email,
        password,
        tenantId
      });
      const payload = response.data?.data;
      if (payload?.token) {
        localStorage.setItem('authToken', payload.token);
        localStorage.setItem('tenantId', tenantId);
        if (payload.refreshToken) {
          localStorage.setItem('refreshToken', payload.refreshToken);
        }
      }
      return payload;
    } catch (error: any) {
      console.error('Erro no login:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'N/A'
      });

      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error || 'Erro ao fazer login';
        const customError = new Error(message);
        (customError as any).response = error.response;
        (customError as any).status = error.response.status;
        throw customError;
      } else if (error.request) {
        const errorMessage = error.code === 'ECONNABORTED' 
          ? 'Tempo de conexão esgotado. Verifique se o servidor está acessível.'
          : error.code === 'ERR_NETWORK'
          ? `Erro de rede. Verifique se a URL da API está correta: ${API_BASE_URL}`
          : `Erro de conexão. Não foi possível conectar ao servidor em ${API_BASE_URL}. Verifique se o backend está rodando e acessível.`;
        const customError = new Error(errorMessage);
        (customError as any).request = error.request;
        (customError as any).code = error.code;
        throw customError;
      } else {
        const customError = new Error('Erro ao processar a solicitação. Tente novamente.');
        (customError as any).originalError = error;
        throw customError;
      }
    }
  }

  async register(userData: any) {
    return this.api.post('/users', userData);
  }

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tenantId');
  }

  // User endpoints
  async getCurrentUser() {
    const config: any = {
      _isCheckAuth: true
    };
    const response = await this.api.get('/users/me', config);
    return response.data?.data;
  }

  async getUsers() {
    const response = await this.api.get('/users');
    return normalizeApiResponse(response);
  }

  async getTeamMembers() {
    const response = await this.api.get('/users');
    return normalizeApiResponse(response);
  }

  async createUser(userData: any) {
    return this.api.post('/users', userData);
  }

  async updateUser(userId: string, userData: any) {
    return this.api.put(`/users/${userId}`, userData);
  }

  async deleteUser(userId: string) {
    return this.api.delete(`/users/${userId}`);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    return this.api.put(`/users/${userId}/password`, {
      currentPassword,
      newPassword
    });
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const tenantId = localStorage.getItem('tenantId') || 'default-tenant';
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await this.api.post('/users/auth/refresh', {}, {
      headers: { 'X-Refresh-Token': refreshToken, 'X-Tenant-ID': tenantId }
    });
    const payload = response.data?.data;
    if (payload?.token) {
      localStorage.setItem('authToken', payload.token);
      if (payload.refreshToken) {
        localStorage.setItem('refreshToken', payload.refreshToken);
      }
    }
    return payload;
  }

  // Project endpoints
  async getProjects() {
    const cacheKey = 'getProjects';
    const existingRequest = this.requestQueue.get(cacheKey);
    if (existingRequest) {
      return existingRequest;
    }
    
    const promise = this.api.get('/projects')
      .then(response => {
        this.requestQueue.delete(cacheKey);
        return normalizeApiResponse(response);
      })
      .catch(error => {
        this.requestQueue.delete(cacheKey);
        throw error;
      });
    
    this.requestQueue.set(cacheKey, promise);
    
    setTimeout(() => {
      this.requestQueue.delete(cacheKey);
    }, 5000);
    
    return promise;
  }

  async getProject(projectId: string) {
    const response = await this.api.get(`/projects/${projectId}`);
    return normalizeApiResponse(response);
  }

  async createProject(projectData: any) {
    const response = await this.api.post('/projects', projectData);
    return normalizeApiResponse(response);
  }

  async updateProject(projectId: string, projectData: any) {
    const response = await this.api.put(`/projects/${projectId}`, projectData);
    return normalizeApiResponse(response);
  }

  async deleteProject(projectId: string) {
    return this.api.delete(`/projects/${projectId}`);
  }

  async changeProjectStatus(projectId: string, status: string) {
    return this.api.put(`/projects/${projectId}/status`, { status });
  }

  // Task endpoints
  async getTasks(projectId?: string) {
    const params = projectId ? { projectId } : {};
    const response = await this.api.get('/tasks', { params });
    return normalizeApiResponse(response);
  }

  async getTask(taskId: string) {
    const response = await this.api.get(`/tasks/${taskId}`);
    return normalizeApiResponse(response);
  }

  async createTask(taskData: any) {
    const response = await this.api.post('/tasks', taskData);
    return normalizeApiResponse(response);
  }

  async updateTask(taskId: string, taskData: any) {
    const response = await this.api.put(`/tasks/${taskId}`, taskData);
    return normalizeApiResponse(response);
  }

  async deleteTask(taskId: string) {
    return this.api.delete(`/tasks/${taskId}`);
  }

  async logTime(taskId: string, timeData: any) {
    return this.api.post(`/tasks/${taskId}/time`, timeData);
  }

  async changeTaskStatus(taskId: string, status: string) {
    return this.api.put(`/tasks/${taskId}/status`, { status });
  }

  async reassignTask(taskId: string, assigneeId: string) {
    return this.api.put(`/tasks/${taskId}/reassign`, { assigneeId });
  }

  async addTaskComment(taskId: string, commentData: any) {
    const response = await this.api.post(`/tasks/${taskId}/comments`, commentData);
    return normalizeApiResponse(response);
  }

  async uploadTaskFiles(taskId: string, formData: FormData) {
    const response = await this.api.post(`/tasks/${taskId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return normalizeApiResponse(response);
  }

  async deleteTaskFile(taskId: string, fileId: string) {
    const response = await this.api.delete(`/tasks/${taskId}/files/${fileId}`);
    return normalizeApiResponse(response);
  }

  // Client endpoints
  async getClients() {
    const response = await this.api.get('/clients');
    return normalizeApiResponse(response);
  }

  async getClient(clientId: string) {
    const response = await this.api.get(`/clients/${clientId}`);
    return normalizeApiResponse(response);
  }

  async createClient(clientData: any) {
    return this.api.post('/clients', clientData);
  }

  async updateClient(clientId: string, clientData: any) {
    return this.api.put(`/clients/${clientId}`, clientData);
  }

  async deleteClient(clientId: string) {
    return this.api.delete(`/clients/${clientId}`);
  }

  // Supplier endpoints
  async getSuppliers() {
    const response = await this.api.get('/suppliers');
    return normalizeApiResponse(response);
  }

  async getSupplier(supplierId: string) {
    const response = await this.api.get(`/suppliers/${supplierId}`);
    return normalizeApiResponse(response);
  }

  async createSupplier(supplierData: any) {
    return this.api.post('/suppliers', supplierData);
  }

  async updateSupplier(supplierId: string, supplierData: any) {
    return this.api.put(`/suppliers/${supplierId}`, supplierData);
  }

  async deleteSupplier(supplierId: string) {
    return this.api.delete(`/suppliers/${supplierId}`);
  }

  // Reports endpoints
  async getDashboardReport() {
    const response = await this.api.get('/reports/dashboard');
    return normalizeApiResponse(response);
  }

  async getProjectReport(projectId: string) {
    return this.api.get(`/reports/project/${projectId}`);
  }

  async getTaskReport(taskId: string) {
    return this.api.get(`/reports/task/${taskId}`);
  }

  async getClientReport(clientId: string) {
    return this.api.get(`/reports/client/${clientId}`);
  }

  async getSupplierReport(supplierId: string) {
    return this.api.get(`/reports/supplier/${supplierId}`);
  }

  // Notification endpoints
  async getNotifications() {
    const response = await this.api.get('/notifications');
    return normalizeApiResponse(response);
  }

  async getUnreadCount() {
    const response = await this.api.get('/notifications/unread-count');
    return normalizeApiResponse(response);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.api.post(`/notifications/${notificationId}/read`);
  }

  async markAllNotificationsAsRead() {
    return this.api.post('/notifications/read-all');
  }

  async healthCheck() {
    const baseURL = this.api.defaults.baseURL || '';
    if (baseURL.includes('/api/v1')) {
      const baseWithoutApi = baseURL.replace('/api/v1', '');
      return axios.get(`${baseWithoutApi}/api/v1/health`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    return this.api.get('/health');
  }

  async getExpenses(filters?: { projectId?: string; supplierId?: string; status?: string; category?: string; startDate?: string; endDate?: string; search?: string }) {
    const response = await this.api.get('/expenses', { params: filters });
    return normalizeApiResponse(response);
  }

  async getExpense(expenseId: string) {
    const response = await this.api.get(`/expenses/${expenseId}`);
    return normalizeApiResponse(response);
  }

  async createExpense(expenseData: any) {
    const response = await this.api.post('/expenses', expenseData);
    return normalizeApiResponse(response);
  }

  async updateExpense(expenseId: string, expenseData: any) {
    const response = await this.api.put(`/expenses/${expenseId}`, expenseData);
    return normalizeApiResponse(response);
  }

  async deleteExpense(expenseId: string) {
    return this.api.delete(`/expenses/${expenseId}`);
  }

  async approveExpense(expenseId: string, approvedBy: string) {
    const response = await this.api.post(`/expenses/${expenseId}/approve`, { approvedBy });
    return normalizeApiResponse(response);
  }

  async rejectExpense(expenseId: string, approvedBy: string) {
    const response = await this.api.post(`/expenses/${expenseId}/reject`, { approvedBy });
    return normalizeApiResponse(response);
  }

  async markExpenseAsPaid(expenseId: string) {
    const response = await this.api.post(`/expenses/${expenseId}/mark-as-paid`);
    return normalizeApiResponse(response);
  }

  async getInvoices(filters?: { projectId?: string; clientId?: string; supplierId?: string; status?: string; type?: string; startDate?: string; endDate?: string; search?: string }) {
    const response = await this.api.get('/invoices', { params: filters });
    return normalizeApiResponse(response);
  }

  async getInvoice(invoiceId: string) {
    const response = await this.api.get(`/invoices/${invoiceId}`);
    return normalizeApiResponse(response);
  }

  async createInvoice(invoiceData: any) {
    const response = await this.api.post('/invoices', invoiceData);
    return normalizeApiResponse(response);
  }

  async updateInvoice(invoiceId: string, invoiceData: any) {
    const response = await this.api.put(`/invoices/${invoiceId}`, invoiceData);
    return normalizeApiResponse(response);
  }

  async deleteInvoice(invoiceId: string) {
    return this.api.delete(`/invoices/${invoiceId}`);
  }

  async sendInvoice(invoiceId: string) {
    const response = await this.api.post(`/invoices/${invoiceId}/send`);
    return normalizeApiResponse(response);
  }

  async markInvoiceAsPaid(invoiceId: string, paymentDate?: Date) {
    const response = await this.api.post(`/invoices/${invoiceId}/mark-as-paid`, { paymentDate: paymentDate || new Date() });
    return normalizeApiResponse(response);
  }

  async cancelInvoice(invoiceId: string) {
    const response = await this.api.post(`/invoices/${invoiceId}/cancel`);
    return normalizeApiResponse(response);
  }

  async getPayments(filters?: { invoiceId?: string; expenseId?: string; status?: string; method?: string; startDate?: string; endDate?: string; search?: string }) {
    const response = await this.api.get('/payments', { params: filters });
    return normalizeApiResponse(response);
  }

  async getPayment(paymentId: string) {
    const response = await this.api.get(`/payments/${paymentId}`);
    return normalizeApiResponse(response);
  }

  async createPayment(paymentData: any) {
    const response = await this.api.post('/payments', paymentData);
    return normalizeApiResponse(response);
  }

  async updatePayment(paymentId: string, paymentData: any) {
    const response = await this.api.put(`/payments/${paymentId}`, paymentData);
    return normalizeApiResponse(response);
  }

  async deletePayment(paymentId: string) {
    return this.api.delete(`/payments/${paymentId}`);
  }

  async processPayment(paymentId: string, transactionId: string) {
    const response = await this.api.post(`/payments/${paymentId}/process`, { transactionId });
    return normalizeApiResponse(response);
  }

  async completePayment(paymentId: string) {
    const response = await this.api.post(`/payments/${paymentId}/complete`);
    return normalizeApiResponse(response);
  }

  async refundPayment(paymentId: string) {
    const response = await this.api.post(`/payments/${paymentId}/refund`);
    return normalizeApiResponse(response);
  }

  async getFinancialDashboardReport(filters?: { startDate?: string; endDate?: string; projectId?: string; category?: string }) {
    const response = await this.api.get('/financial-reports/dashboard', { params: filters });
    return normalizeApiResponse(response);
  }

  async getExpenseReport(filters?: { startDate?: string; endDate?: string; projectId?: string; category?: string }) {
    const response = await this.api.get('/financial-reports/expenses', { params: filters });
    return normalizeApiResponse(response);
  }

  async getIncomeReport(filters?: { startDate?: string; endDate?: string; projectId?: string }) {
    const response = await this.api.get('/financial-reports/income', { params: filters });
    return normalizeApiResponse(response);
  }

  async getCashFlowReport(filters?: { startDate?: string; endDate?: string }) {
    const response = await this.api.get('/financial-reports/cash-flow', { params: filters });
    return normalizeApiResponse(response);
  }

  async getProjectFinancialReport(projectId: string, filters?: { startDate?: string; endDate?: string }) {
    const response = await this.api.get(`/financial-reports/project/${projectId}`, { params: filters });
    return normalizeApiResponse(response);
  }

  async getTemplates(filters?: any) {
    const response = await this.api.get('/templates', { params: filters });
    return normalizeApiResponse(response);
  }

  async createTemplate(templateData: any) {
    const response = await this.api.post('/templates', templateData);
    return normalizeApiResponse(response);
  }

  async updateTemplate(templateId: string, templateData: any) {
    const response = await this.api.put(`/templates/${templateId}`, templateData);
    return normalizeApiResponse(response);
  }

  async deleteTemplate(templateId: string) {
    return this.api.delete(`/templates/${templateId}`);
  }

  async useTemplate(templateId: string, projectId: string) {
    const response = await this.api.post(`/templates/${templateId}/use`, { projectId });
    return normalizeApiResponse(response);
  }

  async getUserSettings() {
    const response = await this.api.get('/users/me/settings');
    return normalizeApiResponse(response);
  }

  async updateUserSettings(settings: any) {
    const response = await this.api.put('/users/me/settings', settings);
    return normalizeApiResponse(response);
  }

  async getTenantSettings() {
    const response = await this.api.get('/tenants/settings');
    return normalizeApiResponse(response);
  }

  async updateTenantSettings(settings: any) {
    const response = await this.api.put('/tenants/settings', settings);
    return normalizeApiResponse(response);
  }

  async getManagerDashboard() {
    const response = await this.api.get('/reports/dashboard/manager');
    return normalizeApiResponse(response);
  }

  async getEmployeeDashboard() {
    const response = await this.api.get('/reports/dashboard/employee');
    return normalizeApiResponse(response);
  }

  async getDirectorDashboard() {
    const response = await this.api.get('/reports/dashboard/director');
    return normalizeApiResponse(response);
  }

  getApiInstance(): AxiosInstance {
    return this.api;
  }

  // Importação
  async detectImportColumns(file: FormData): Promise<any> {
    const response = await this.api.post('/import/detect-columns', file, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return normalizeApiResponse(response);
  }

  async importData(type: 'projects' | 'tasks' | 'clients', data: FormData): Promise<any> {
    const response = await this.api.post(`/import/${type}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return normalizeApiResponse(response);
  }

  // Documentos
  async getEntityDocuments(entityType: 'user' | 'client', entityId: string): Promise<any> {
    const response = await this.api.get(`/${entityType === 'user' ? 'users' : 'clients'}/${entityId}/documents`);
    return normalizeApiResponse(response);
  }

  async uploadEntityDocument(data: FormData): Promise<any> {
    const response = await this.api.post('/files/upload-entity-document', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return normalizeApiResponse(response);
  }

  async deleteEntityDocument(entityType: 'user' | 'client', entityId: string, documentId: string): Promise<any> {
    const response = await this.api.delete(`/${entityType === 'user' ? 'users' : 'clients'}/${entityId}/documents/${documentId}`);
    return normalizeApiResponse(response);
  }
}

export const apiService = new ApiService();
export default apiService;
