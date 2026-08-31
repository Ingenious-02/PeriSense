const API_BASE = '';

export async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers: options.body instanceof FormData ? (options.headers || {}) : headers
  });

  if (!response.ok) {
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

  // Patients
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

  // Assessments
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

  // Notifications
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

  // Analytics
  getAnalytics: async () => {
    return request('/api/analytics');
  },

  // Auth
  login: async (email, password) => {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register: async (userData) => {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  getCurrentUser: async (email = 'adeyemi@perisense.health') => {
    return request(`/api/auth/me?email=${encodeURIComponent(email)}`);
  }
};
