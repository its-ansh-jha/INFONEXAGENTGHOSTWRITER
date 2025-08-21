const API_BASE = '/api';

interface ApiResponse<T = any> {
  data: T;
  error?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('auth-token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      headers: defaultHeaders,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      let data: any; // Declare data variable here

      // Check if the response has a body before trying to parse it as JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON responses, e.g., plain text or empty responses
        data = await response.text(); 
      }
      

      if (!response.ok) {
        // If response is not OK, try to get error message from JSON, otherwise use status text
        const errorMessage = (typeof data === 'object' && data !== null && 'error' in data) 
          ? data.error 
          : response.statusText;
        throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
      }

      // If response is OK, and we got JSON, return it. Otherwise, return the raw data.
      return { data: (typeof data === 'object' && data !== null && 'error' in data) ? data.data : data };
    } catch (error) {
      console.error('API request failed:', error);
      // Ensure error message is a string and handle cases where error is not an instance of Error
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { 
        data: null as T, 
        error: errorMessage || 'Unknown error' 
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();