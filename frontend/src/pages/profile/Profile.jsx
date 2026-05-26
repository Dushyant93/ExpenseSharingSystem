// Profile Page
// Shows user profile information and activity statistics
// Also allows navigating to edit profile and change password

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axiosConfig';
import Navbar from '../../components/Navbar';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState('');

  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/profile', authConfig());
        setProfile(res.data.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        else setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) return <><Navbar /><div className="loading">Loading profile...</div></>;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h2>👤 My Profile</h2>
            <p>Your account details and activity</p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/profile/edit')}>
            Edit Profile
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {profile && (
          <>
            {/* Avatar and name card */}
            <div className="card" style={styles.profileCard}>
              <div style={styles.avatarLarge}>
                {profile.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={styles.profileName}>{profile.name}</div>
                <div style={styles.profileEmail}>{profile.email}</div>
                {profile.university && <div style={styles.profileSub}>{profile.university}</div>}
                {profile.address    && <div style={styles.profileSub}>{profile.address}</div>}
              </div>
            </div>

            {/* Activity stats */}
            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>🏷️</div>
                <div style={styles.statNum}>{profile.stats?.groupCount || 0}</div>
                <div style={styles.statLabel}>Groups</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>💳</div>
                <div style={styles.statNum}>{profile.stats?.expenseCount || 0}</div>
                <div style={styles.statLabel}>Expenses</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>💰</div>
                <div style={styles.statNum}>${profile.stats?.totalSpent?.toFixed(2) || '0.00'}</div>
                <div style={styles.statLabel}>Total Spent</div>
              </div>
            </div>

            {/* Actions */}
            <div className="card">
              <div style={styles.actionRow} onClick={() => navigate('/profile/edit')}>
                <span>✏️ Edit Profile</span>
                <span style={{ color: '#AAA' }}>›</span>
              </div>
              <div style={{ ...styles.actionRow, borderTop: '1px solid #F0F0F0' }}
                onClick={() => navigate('/profile/change-password')}>
                <span>🔒 Change Password</span>
                <span style={{ color: '#AAA' }}>›</span>
              </div>
              <div style={{ ...styles.actionRow, borderTop: '1px solid #F0F0F0', color: '#EF4444' }}
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}>
                <span>🚪 Log Out</span>
                <span style={{ color: '#AAA' }}>›</span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

const styles = {
  profileCard:  { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' },
  avatarLarge:  { width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,#C850C0,#4158D0)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '26px', flexShrink: 0 },
  profileName:  { fontSize: '20px', fontWeight: 800, color: '#1A1A1A' },
  profileEmail: { fontSize: '13px', color: '#666', marginTop: '3px' },
  profileSub:   { fontSize: '12px', color: '#AAA', marginTop: '2px' },
  statsRow:     { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' },
  statCard:     { background: '#fff', borderRadius: '12px', padding: '16px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.07)' },
  statIcon:     { fontSize: '22px', marginBottom: '6px' },
  statNum:      { fontSize: '20px', fontWeight: 800, color: '#1A1A1A' },
  statLabel:    { fontSize: '11px', color: '#666', marginTop: '3px' },
  actionRow:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#1A1A1A' },
};

export default Profile;
