const API_BASE_URL = localStorage.getItem('ojtrack_custom_api') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getAuthToken = () => sessionStorage.getItem('token') || localStorage.getItem('token');

export const fetchWithAuth = async (url, options = {}, retries = 1) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };
  
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  
  try {
    return await fetch(url, { ...options, headers });
  } catch (err) {
    if (retries > 0) {
      // Retry once after brief pause (helps when server is waking up or network blip)
      await new Promise(r => setTimeout(r, 1500));
      return fetchWithAuth(url, options, retries - 1);
    }
    throw err;
  }
};

// Silent warmup ping to prevent Render cold starts
export const warmupBackend = () => {
  try {
    fetch(`${API_BASE_URL}/admin/announcements`, { method: 'GET' }).catch(() => {});
  } catch (e) {
    // Ignore warmup failure
  }
};

export default API_BASE_URL;
