// Register Page - matches the starter project's auth pattern
// Uses axios to call /api/auth/register

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Update state when user types
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit register form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check passwords match before sending
    if (formData.password !== formData.confirm) {
      return setError('Passwords do not match.');
    }

    setLoading(true);

    try {
      await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Redirect to login after successful registration
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* App logo. */}
        <div className="auth-logo">
          <h1>💸 SettleUp</h1>
          <p>Split expenses with friends, simply.</p>
        </div>

        {/* Sign In / Register tabs */}
        <div className="auth-tabs">
          <button className="auth-tab" onClick={() => navigate('/login')}>Sign In</button>
          <button className="auth-tab active">Register</button>
        </div>

        <h2 className="auth-heading">Create Account</h2>
        <p className="auth-sub">Join SettleUp - it's free!</p>

        {/* Error message */}
        {error && <div className="error-msg">{error}</div>}

        {/* Register form */}
        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label>Full Name</label>
            <input type="text" name="name" placeholder="e.g. Dushyant Singh"
              value={formData.name} onChange={handleChange} required />
          </div>

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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirm"
              placeholder="Repeat your password"
              value={formData.confirm}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <a onClick={() => navigate('/login')}>Sign In →</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
