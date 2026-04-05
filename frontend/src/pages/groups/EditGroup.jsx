// EditGroup Page - form to update an existing group
// Loads the current group data and pre-fills the form

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const ICONS = ['🏠', '🏖️', '🍕', '🎮', '✈️', '🎉', '🏋️', '📚', '🚗', '💼', '🎵', '🐾'];

const EditGroup = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // group ID from URL

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '👥',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Helper to attach JWT to every request
  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  // Load existing group data to pre-fill the form
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(`/api/groups/${id}`, authConfig());
        const g = res.data;
        setFormData({
          name: g.name,
          description: g.description || '',
          icon: g.icon,
        });
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        else setError('Failed to load group.');
      } finally {
        setFetching(false);
      }
    };
    fetchGroup();
  }, [id, navigate]);

  // Update state when user types
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Pick an icon from the grid
  const handleIconPick = (icon) => {
    setFormData({ ...formData, icon });
  };

  // Submit updated data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.put(`/api/groups/${id}`, formData, authConfig());
      navigate('/groups'); // go back to list after saving
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update group.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <><Navbar /><div className="loading">Loading group...</div></>;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2>✏️ Edit Group</h2>
            <p>Update the group details</p>
          </div>
        </div>

        <div className="form-card">
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* Icon picker */}
            <div className="field-group">
              <label>Group Icon</label>
              <select name="icon" value={formData.icon} onChange={handleChange}>
                <option value="🏠">🏠 House</option>
                <option value="🏖️">🏖️ Holiday</option>
                <option value="🍕">🍕 Food</option>
                <option value="🎮">🎮 Gaming</option>
                <option value="✈️">✈️ Travel</option>
                <option value="🎉">🎉 Events</option>
                <option value="💼">💼 Work</option>
                <option value="👥">👥 General</option>
              </select>
            </div>

            {/* Group name */}
            <div className="field-group">
              <label>Group Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Brisbane Flat"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div className="field-group">
              <label>Description (optional)</label>
              <textarea
                name="description"
                placeholder="What is this group for?"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Buttons */}
            <div style={styles.btnRow}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/groups')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: 'auto', padding: '12px 32px', marginTop: 0 }}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

const styles = {
  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '8px',
    marginBottom: '8px',
  },
  iconBtn: {
    fontSize: '24px',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  selectedIcon: {
    fontSize: '12px',
    color: '#666',
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
};

export default EditGroup;
