import axios from 'axios';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('aivara_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const api = {
  // Auth endpoints
  signUp: async (email, password, fullName) => {
    const res = await client.post('/auth/signup', { email, password, full_name: fullName });
    return res.data;
  },
  signIn: async (email, password) => {
    const res = await client.post('/auth/login', { email, password });
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await client.get('/auth/me');
    return res.data;
  },

  // Session endpoints
  getSessions: async () => {
    const res = await client.get('/sessions');
    return res.data;
  },
  createSession: async (title = 'New Consultation', specialty = 'General', mode = 'Chat') => {
    const res = await client.post('/sessions', { title, specialty, mode });
    return res.data;
  },
  getSession: async (id) => {
    const res = await client.get(`/sessions/${id}`);
    return res.data;
  },
  deleteSession: async (id) => {
    const res = await client.delete(`/sessions/${id}`);
    return res.data;
  },
  getSessionMessages: async (id) => {
    const res = await client.get(`/sessions/${id}/messages`);
    return res.data;
  },

  // Profile endpoints
  getProfile: async () => {
    const res = await client.get('/profile');
    return res.data;
  },
  updateProfile: async (profileData) => {
    const res = await client.put('/profile', profileData);
    return res.data;
  },

  // Knowledge base endpoints (Admin)
  getDocuments: async () => {
    const res = await client.get('/knowledge/documents');
    return res.data;
  },
  deleteDocument: async (docId) => {
    const res = await client.delete(`/knowledge/documents/${docId}`);
    return res.data;
  },
  uploadDocument: async (formData) => {
    const res = await client.post('/knowledge/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  testQuery: async (query) => {
    const res = await client.post('/knowledge/test-query', { query });
    return res.data;
  },

  // Analytics endpoints (Admin)
  getAnalytics: async () => {
    const res = await client.get('/analytics/usage');
    return res.data;
  },

  // Chat endpoints
  chatStandard: async (sessionId, message) => {
    const res = await client.post('/chat', { session_id: sessionId, message });
    return res.data;
  },

  // Custom fetch for SSE streaming
  streamChat: async (sessionId, message, token, onEvent, onError, onDone) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ session_id: sessionId, message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Save last partial line
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') {
              onDone();
              return;
            }

            try {
              const eventData = JSON.parse(dataStr);
              onEvent(eventData);
            } catch (err) {
              console.error('Failed to parse SSE event:', err);
            }
          }
        }
      }
    } catch (error) {
      onError(error);
    }
  }
};
