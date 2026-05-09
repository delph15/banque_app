const API_BASE_URL = 'http://localhost:3002';
import authService from './auth';

class ApiService {
  async request(endpoint, options = {}) {
    const token = authService.getToken();
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Client CRUD operations
  async getClients() {
    return this.request('/clients');
  }

  async createClient(clientData) {
    return this.request('/client', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id, clientData) {
    return this.request(`/client/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(id) {
    return this.request(`/client/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
