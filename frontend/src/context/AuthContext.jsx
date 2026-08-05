import { createContext, useContext, useEffect, useState } from 'react';
import API_BASE_URL from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // If we wanted to rehydrate user from token, we could do it here.
    // For now, we rely on the login function to set currentUser.
  }, []);

  const login = async (role, email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || "Login failed" };
      }

      if (data.success) {
        if (data.user.requires_password_change) {
          return { success: true, requires_password_change: true, user_id: data.user.user_id };
        }
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        return { success: true };
      }

      return { success: false, message: data.message };
    } catch (err) {
      console.error("Login request failed:", err);
      return { success: false, message: "Unable to reach the server. Please try again later." };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };
  
  const updateCurrentUser = (user) => setCurrentUser(user);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);