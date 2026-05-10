// Change Password Page

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axiosConfig';
import Navbar from '../../components/Navbar';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error,    setError   ] = useState('');
  const [success,  setSuccess ] = useState('');
  const [loading,  setLoading ] = useState(false);

  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (formData.newPassword !== formData.confirm) {
      return setError('New passwords do not match.');
    }
    if (formData.newPassword.length < 6) {
      return setError('New password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      await axios.put('/api/profile/change-password', {
        currentPassword: formData.currentPassword,
        newPassword:     formData.newPassword,
      }, authConfig());
      setSuccess('Password changed successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="page-header">
          <div><h2>🔒 Change Password</h2><p>Update your account password</p></div>
        </div>
        <div className="form-card">
          {error   && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label>Current Password</label>
              <input type="password" name="currentPassword" placeholder="Enter current password"
                value={formData.currentPassword} onChange={handleChange} required />
            </div>
            <div className="field-group">
              <label>New Password</label>
              <input type="password" name="newPassword" placeholder="Enter new password"
                value={formData.newPassword} onChange={handleChange} required />
            </div>
            <div className="field-group">
              <label>Confirm New Password</label>
              <input type="password" name="confirm" placeholder="Repeat new password"
                value={formData.confirm} onChange={handleChange} required />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button type="button" className="btn-secondary" onClick={() => navigate('/profile')}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 32px', marginTop: 0 }} disabled={loading}>
                {loading ? 'Saving...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
