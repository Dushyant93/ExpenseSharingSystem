// GroupList Page - shows all groups for the logged-in user
// Allows editing and deleting each group

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const GroupList = () => {
  const navigate = useNavigate();

  const [groups,  setGroups ] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState('');

  // Helper to attach JWT to every request
  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  // Load all groups when page opens
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await axios.get('/api/groups', authConfig());
      setGroups(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else setError('Failed to load groups.');
    } finally {
      setLoading(false);
    }
  };

  // Delete a group by ID
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    try {
      await axios.delete(`/api/groups/${id}`, authConfig());
      // Remove from local state without re-fetching
      setGroups(groups.filter((g) => g._id !== id));
    } catch (err) {
      setError('Failed to delete group.');
    }
  };

  if (loading) return <><Navbar /><div className="loading">Loading groups...</div></>;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2>🏷️ Groups</h2>
            <p>{groups.length} group{groups.length !== 1 ? 's' : ''} found</p>
          </div>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 20px', marginTop: 0 }}
            onClick={() => navigate('/groups/add')}
          >
            + New Group
          </button>
        </div>

        {/* Error */}
        {error && <div className="error-msg">{error}</div>}

        {/* Empty state */}
        {groups.length === 0 ? (
          <div className="empty-state">
            <div className="icon">👥</div>
            <p>No groups yet. Create your first group to start tracking expenses!</p>
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '10px 24px' }}
              onClick={() => navigate('/groups/add')}
            >
              Create Group
            </button>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group._id} className="card">
              <div className="card-row">

                {/* Left: icon + name + description */}
                <div style={styles.left}>
                  <div style={styles.icon}>{group.icon}</div>
                  <div>
                    <div style={styles.name}>{group.name}</div>
                    <div style={styles.desc}>
                      {group.description || 'No description'}
                    </div>
                    <div style={styles.meta}>
                      Created by {group.createdBy?.username || 'you'} ·{' '}
                      {new Date(group.createdAt).toLocaleDateString('en-AU')}
                    </div>
                  </div>
                </div>

                {/* Right: action buttons */}
                <div className="card-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => navigate(`/groups/edit/${group._id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(group._id)}
                  >
                    Delete
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

const styles = {
  left: {
    display:    'flex',
    alignItems: 'center',
    gap:        '14px',
    flex:       1,
  },
  icon: { fontSize: '32px' },
  name: { fontSize: '15px', fontWeight: 700, color: '#1A1A1A' },
  desc: { fontSize: '13px', color: '#666', marginTop: '2px' },
  meta: { fontSize: '11px', color: '#AAA', marginTop: '4px' },
};

export default GroupList;
