const API_BASE = '';

export function getAuthToken() {
  return localStorage.getItem('perisense_jwt_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('perisense_jwt_token', token);
  } else {
    localStorage.removeItem('perisense_jwt_token');
  }
}

export async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers: options.body instanceof FormData 
      ? { ...(token ? { 'Authorization': `Bearer ${token}` } : {}), ...(options.headers || {}) }
      : headers
  });

  if (!response.ok) {
    // If token expired / unauthorized, trigger session expiration event
    if (response.status === 401 && !endpoint.includes('/login')) {
      localStorage.removeItem('perisense_jwt_token');
      localStorage.removeItem('perisense_user');
      window.dispatchEvent(new CustomEvent('perisense_auth_expired'));
    }

    let errorDetail = 'An error occurred';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text() || response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // ML Inference
  predict: async (data, patientName = 'Unknown Patient', gestationalAge = '24 Weeks') => {
    const query = new URLSearchParams({
      patient_name: patientName,
      gestational_age: gestationalAge
    }).toString();
    return request(`/api/predict?${query}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  predictStandard: async (data) => {
    return request('/predict', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  batchPredict: async (formData) => {
    return request('/api/batch-predict', {
      method: 'POST',
      body: formData
    });
  },

  getModelInfo: async () => {
    return request('/api/model-info');
  },

  // Patients (Protected)
  getPatients: async (search = '', riskFilter = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (riskFilter) params.append('risk_filter', riskFilter);
    return request(`/api/patients?${params.toString()}`);
  },

  getPatient: async (id) => {
    return request(`/api/patients/${id}`);
  },

  createPatient: async (patientData) => {
    return request('/api/patients', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
  },

  deletePatient: async (id) => {
    return request(`/api/patients/${id}`, {
      method: 'DELETE'
    });
  },

  // Assessments (Protected)
  getAssessments: async (search = '', risk = '', limit = 50) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (risk) params.append('risk', risk);
    if (limit) params.append('limit', limit);
    return request(`/api/assessments?${params.toString()}`);
  },

  createAssessment: async (assessmentData) => {
    return request('/api/assessments', {
      method: 'POST',
      body: JSON.stringify(assessmentData)
    });
  },

  getAssessment: async (id) => {
    return request(`/api/assessments/${id}`);
  },

  // Notifications (Protected)
  getNotifications: async () => {
    return request('/api/notifications');
  },

  markNotificationRead: async (id) => {
    return request(`/api/notifications/${id}/read`, {
      method: 'POST'
    });
  },

  markAllNotificationsRead: async () => {
    return request('/api/notifications/mark-all-read', {
      method: 'POST'
    });
  },

  // Analytics (Protected)
  getAnalytics: async () => {
    return request('/api/analytics');
  },

  // Authentication
  login: async (email, password) => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.access_token) {
      setAuthToken(res.access_token);
    }
    return res;
  },

  register: async (userData) => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res.access_token) {
      setAuthToken(res.access_token);
    }
    return res;
  },

  getCurrentUser: async () => {
    return request('/api/auth/me');
  },

  refreshToken: async () => {
    const res = await request('/api/auth/refresh', {
      method: 'POST'
    });
    if (res.access_token) {
      setAuthToken(res.access_token);
    }
    return res;
  }
};
