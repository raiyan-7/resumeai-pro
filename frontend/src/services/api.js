const BASE_URL = '/api';

class ApiClient {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    // Set headers
    const headers = {
      ...options.headers,
    };

    // Do not set Content-Type if uploading a file (multipart)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      
      if (response.status === 204) {
        return null;
      }

      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonErr) {
          data = { detail: 'Failed to parse JSON response payload.' };
        }
      } else {
        const text = await response.text();
        data = { detail: text || `HTTP Error ${response.status}` };
      }
      
      if (!response.ok) {
        // Handle token expiry redirect
        if (response.status === 401 && token) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        
        const errorMsg = data.detail || response.statusText || `Request failed with status ${response.status}`;
        const error = new Error(errorMsg);
        error.status = response.status;
        error.detail = errorMsg;
        throw error;
      }
      
      return data;
    } catch (err) {
      if (err.status) throw err;
      throw new Error(err.message || 'Network connection failed');
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
