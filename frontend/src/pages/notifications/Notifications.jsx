// Notifications Page
// Shows all notifications for the logged-in user
// Notifications are created automatically by the Observer pattern when expenses are added/settled

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axiosConfig';
import Navbar from '../../components/Navbar';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading      ] = useState(true);
  const [error,         setError        ] = useState('');

  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications', authConfig());
      setNotifications(res.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put('/api/notifications/mark-all-read', {}, authConfig());
      // Update local state
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setError('Failed to mark as read.');
    }
  };

  const markOneRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`, {}, authConfig());
      setNotifications(notifications.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  // Icon for each notification type
  const typeIcon = {
    expense_added:       '💳',
    expense_updated:     '✏️',
    expense_deleted:     '🗑️',
    settlement_recorded: '🤝',
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) return <><Navbar /><div className="loading">Loading notifications...</div></>;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h2>🔔 Notifications</h2>
            <p>{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <button className="btn-secondary" onClick={markAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        {error && <div className="error-msg">{error}</div>}

        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔔</div>
            <p>No notifications yet. They appear when group members add expenses or record settlements.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className="card"
              style={{ opacity: n.isRead ? 0.6 : 1, borderLeft: n.isRead ? 'none' : '4px solid #6C3CE1' }}
              onClick={() => !n.isRead && markOneRead(n._id)}>
              <div className="card-row">
                <div style={styles.left}>
                  <div style={styles.icon}>{typeIcon[n.type] || '🔔'}</div>
                  <div>
                    <div style={styles.msg}>{n.message}</div>
                    <div style={styles.time}>{new Date(n.createdAt).toLocaleString('en-AU')}</div>
                  </div>
                </div>
                {!n.isRead && <div style={styles.dot}></div>}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

const styles = {
  left: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 },
  icon: { fontSize: '24px' },
  msg:  { fontSize: '14px', fontWeight: 600, color: '#1A1A1A' },
  time: { fontSize: '11px', color: '#AAA', marginTop: '3px' },
  dot:  { width: '10px', height: '10px', borderRadius: '50%', background: '#6C3CE1', flexShrink: 0 },
};

export default Notifications;
