import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/hotlist/user/profile');
      setUser(response.data);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone, code) => {
    try {
      const response = await axios.post('/api/auth/login', { phone, code });
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '登录失败' };
    }
  };

  const sendCode = async (phone) => {
    try {
      const response = await axios.post('/api/auth/send-code', { phone });
      return response.data;
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '发送验证码失败' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, sendCode, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
