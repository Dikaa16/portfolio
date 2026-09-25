import React, { useState } from 'react';
import { api, setToken } from '../../lib/api';

const loginErrorMessage = (error) => {
  if (!error.response) return 'Cannot reach server. Please try again in a moment.';
  if (error.response.status === 429) return 'Too many login attempts. Please wait 15 minutes.';
  if (error.response.status === 401) return 'Incorrect password';
  return error.response.data?.message || 'Login failed';
};

function AdminLogin({ onLogin, notice }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(notice || '');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/admin/login', { password });
      setToken(response.data.token);
      onLogin();
    } catch (err) {
      setError(loginErrorMessage(err));
    }
  };

  return (
    <div className="admin-login">
      <div className="login-box">
        <h1>Admin Login</h1>
        <p>Enter password to access admin panel</p>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="login-input"
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
