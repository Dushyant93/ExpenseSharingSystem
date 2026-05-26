// Edit Profile Page

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axiosConfig';
import Navbar from '../../components/Navbar';

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', university: '', address: '' });
  const [error,    setError   ] = useState('');
  const [success,  setSuccess ] = useState('');
  const [loading,  setLoading ] = useState(false);

  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/profile', authConfig());
        const p   = res.data.data;
        setFormData({ name: p.name, email: p.email, university: p.university || '', address: p.address || '' });
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await axios.put('/api/profile', formData, authConfig());
      localStorage.setItem('username', formData.name);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="page-header">
          <div><h2>✏️ Edit Profile</h2><p>Update your account details</p></div>
        </div>
        <div className="form-card">
          {error   && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="field-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="field-group">
              <label>University (optional)</label>
              <input type="text" name="university" value={formData.university} onChange={handleChange} />
            </div>
            <div className="field-group">
              <label>Address (optional)</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button type="button" className="btn-secondary" onClick={() => navigate('/profile')}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 32px', marginTop: 0 }} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
