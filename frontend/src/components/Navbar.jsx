import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

const Navbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';
  const [unreadCount, setUnreadCount] = useState(0);

  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  // Fetch unread notification count on mount
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get('/api/notifications/unread-count', authConfig());
        setUnreadCount(res.data.data?.count || 0);
      } catch {
        // Don't crash if this fails
      }
    };
    if (localStorage.getItem('token')) fetchCount();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/dashboard" style={styles.logo}>
          💸 <span style={styles.logoText}>SettleUp</span>
        </Link>

        <div style={styles.links}>
          <Link to="/dashboard" style={styles.link}>Dashboard</Link>
          <Link to="/groups"    style={styles.link}>Groups</Link>
          <Link to="/expenses"  style={styles.link}>Expenses</Link>
        </div>

        <div style={styles.right}>
          {/* Notification bell */}
          <div style={styles.bellWrap} onClick={() => navigate('/notifications')}>
            <span style={styles.bell}>🔔</span>
            {unreadCount > 0 && (
              <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </div>

          {/* Avatar + username → profile */}
          <div style={styles.userWrap} onClick={() => navigate('/profile')}>
            <div style={styles.avatar}>{username.charAt(0).toUpperCase()}</div>
            <span style={styles.username}>{username}</span>
          </div>

          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav:      { background: 'linear-gradient(135deg, #C850C0, #4158D0)', padding: '0 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.2)', position: 'sticky', top: 0, zIndex: 100 },
  inner:    { maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' },
  logo:     { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' },
  logoText: { fontWeight: 800, color: '#fff', fontSize: '18px' },
  links:    { display: 'flex', gap: '24px' },
  link:     { color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 },
  right:    { display: 'flex', alignItems: 'center', gap: '12px' },
  bellWrap: { position: 'relative', cursor: 'pointer' },
  bell:     { fontSize: '20px' },
  badge:    { position: 'absolute', top: '-6px', right: '-8px', background: '#EF4444', color: '#fff', fontSize: '9px', fontWeight: 800, borderRadius: '99px', padding: '1px 5px' },
  userWrap: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  avatar:   { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', color: '#6C3CE1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' },
  username: { color: '#fff', fontSize: '13px', fontWeight: 600 },
  logoutBtn:{ padding: '6px 16px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
};

export default Navbar;