import { createContext, useContext, useEffect, useState } from 'react';
import API_BASE_URL, { warmupBackend } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('ojtrack_user');
      if (token && savedUser) {
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

    const token = localStorage.getItem('token');
    if (!token) return;

    // Verify and refresh session from server
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('ojtrack_user', JSON.stringify(data.user));
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
        localStorage.setItem('token', data.token);
        localStorage.setItem('ojtrack_user', JSON.stringify(data.user));
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
    localStorage.removeItem('token');
    localStorage.removeItem('ojtrack_user');
    localStorage.removeItem('ojtrack_active_page');
    setCurrentUser(null);
  };
  
  const updateCurrentUser = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('ojtrack_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ojtrack_user');
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);