import { createContext, useContext, useEffect, useState } from 'react';
import API_BASE_URL, { warmupBackend, getAuthToken } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const savedUser = sessionStorage.getItem('ojtrack_user') || localStorage.getItem('ojtrack_user');
      if (token && savedUser) {
        // Pin this tab's session in sessionStorage so other tabs logging into different roles don't overwrite it
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('ojtrack_user', savedUser);
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.warn("Could not load cached user session:", e);
    }
    return null;
  });

  useEffect(() => {
    // Warmup backend silently on initial load
    warmupBackend();

    const token = getAuthToken();
    if (!token) return;

    // Verify and refresh session from server
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          const serialized = JSON.stringify(data.user);
          sessionStorage.setItem('ojtrack_user', serialized);
          if (localStorage.getItem('token') === token) {
            localStorage.setItem('ojtrack_user', serialized);
          }
        } else if (data.status === 401 || data.status === 403 || !data.success) {
          // Token expired or invalid
          logout();
        }
      })
      .catch(err => {
        // Keep cached user if server is temporarily unreachable
        console.warn("Server unreachable during session refresh, using cached user:", err);
      });
  }, []);

  const login = async (role, email, password) => {
    try {
      // Helper to do fetch with 1 retry for cold-starts
      const executeLogin = async (attempt = 1) => {
        try {
          return await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
          });
        } catch (fetchErr) {
          if (attempt === 1) {
            await new Promise(r => setTimeout(r, 1500));
            return await executeLogin(2);
          }
          throw fetchErr;
        }
      };

      const res = await executeLogin();
      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || "Login failed" };
      }

      if (data.success) {
        if (data.user.requires_password_change) {
          return { success: true, requires_password_change: true, user_id: data.user.user_id };
        }
        const serializedUser = JSON.stringify(data.user);
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('ojtrack_user', serializedUser);
        localStorage.setItem('token', data.token);
        localStorage.setItem('ojtrack_user', serializedUser);
        setCurrentUser(data.user);
        return { success: true };
      }

      return { success: false, message: data.message };
    } catch (err) {
      console.error("Login request failed:", err);
      return { success: false, message: "Unable to reach the server. The live backend may be waking up, please try again in a moment." };
    }
  };

  const logout = () => {
    const tabToken = sessionStorage.getItem('token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('ojtrack_user');
    sessionStorage.removeItem('ojtrack_active_page');
    if (!tabToken || localStorage.getItem('token') === tabToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('ojtrack_user');
      localStorage.removeItem('ojtrack_active_page');
    }
    setCurrentUser(null);
  };
  
  const updateCurrentUser = (user) => {
    setCurrentUser(user);
    if (user) {
      const serialized = JSON.stringify(user);
      sessionStorage.setItem('ojtrack_user', serialized);
      if (localStorage.getItem('token') === sessionStorage.getItem('token')) {
        localStorage.setItem('ojtrack_user', serialized);
      }
    } else {
      sessionStorage.removeItem('ojtrack_user');
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);