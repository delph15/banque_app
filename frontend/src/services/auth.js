const API_BASE_URL = 'http://localhost:3003';

class AuthService {
  // Stocker le token dans localStorage
  setToken(token) {
    localStorage.setItem('token', token);
  }

  // Récupérer le token depuis localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Supprimer le token (déconnexion)
  removeToken() {
    localStorage.removeItem('token');
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated() {
    return !!this.getToken();
  }

  // Login gérant
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login-gerant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur de connexion');
      }

      const data = await response.json();
      this.setToken(data.token);
      return data;
    } catch (error) {
      console.error('Erreur de login:', error);
      throw error;
    }
  }

  // Register gérant
  async register(username, password, agence_id) {
    try {
      const response = await fetch(`${API_BASE_URL}/register-gerant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, agence_id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur d\'inscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  }

  // Déconnexion
  logout() {
    this.removeToken();
  }
}

export default new AuthService();
