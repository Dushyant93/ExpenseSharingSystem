import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error,    setError   ] = useState('');
  const [loading,  setLoading ] = useState(false);

  // Update state when user types
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit login form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', formData);

      // Save token and username - same pattern as starter project
      localStorage.setItem('token',    res.data.token);
      localStorage.setItem('username', res.data.name);

      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* App logo */}
        <div className="auth-logo">
          <h1>💸 SettleUp</h1>
          <p>Split expenses with friends, simply.</p>
        </div>

        {/* Sign In / Register tabs */}
        <div className="auth-tabs">
          <button className="auth-tab active">Sign In</button>
          <button className="auth-tab" onClick={() => navigate('/register')}>Register</button>
        </div>

        <h2 className="auth-heading">Welcome back!</h2>
        <p className="auth-sub">Sign in to your account</p>

        {/* Error message */}
        {error && <div className="error-msg">{error}</div>}

        {/* Login form */}
        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <a onClick={() => navigate('/register')}>Register →</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
