// AddGroup Page - form to create a new expense group
// Creator is automatically added as the first member

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';

// Emoji options for the group icon picker
const ICONS = ['🏠', '🏖️', '🍕', '🎮', '✈️', '🎉', '🏋️', '📚', '🚗', '💼', '🎵', '🐾'];

const AddGroup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '👥',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to attach JWT to every request
  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  // Update state when user types
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Pick an icon from the grid
  const handleIconPick = (icon) => {
    setFormData({ ...formData, icon });
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/api/groups', formData, authConfig());
      navigate('/groups'); // go back to list after saving
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2>➕ Create Group</h2>
            <p>Start a new expense sharing group</p>
          </div>
        </div>

        <div className="form-card">
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* Icon picker. */}
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
                placeholder="e.g. Brisbane Flat, Bali Trip 2025"
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
                {loading ? 'Creating...' : 'Create Group'}
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

export default AddGroup;
