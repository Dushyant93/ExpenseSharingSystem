// AddExpense Page - form to create a new expense
// Loads the user's groups so they can pick which group the expense belongs to

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const AddExpense = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    groupId: '',
    description: '',
    amount: '',
    category: 'General',
    date: new Date().toISOString().split('T')[0], // today's date
    splitBetween: ''
  });
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // It's an helper to attach JWT to every request
  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  // Load groups for the dropdown
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get('/api/groups', authConfig());
        setGroups(res.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      }
    };
    fetchGroups();
  }, [navigate]);

  // Update state when user types
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Convert comma-separated string to array, trim whitespace
    const dataToSend = {
      ...formData,
      splitBetween: formData.splitBetween
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name !== ''),
    };

    try {
      await axios.post('/api/expenses', dataToSend, authConfig());
      navigate('/expenses');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense.');
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
            <h2>➕ Add Expense</h2>
            <p>Record a new shared expense</p>
          </div>
        </div>

        <div className="form-card">
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* Group picker. */}
            <div className="field-group">
              <label>Group</label>
              <select name="groupId" value={formData.groupId} onChange={handleChange} required>
                <option value="">— Select a group —</option>
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.icon} {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="field-group">
              <label>Description</label>
              <input
                type="text"
                name="description"
                placeholder="e.g. Woolies groceries"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* Amount */}
            <div className="field-group">
              <label>Amount ($)</label>
              <input
                type="number"
                name="amount"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category */}
            <div className="field-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="General">General</option>
                <option value="Groceries">🛒 Groceries</option>
                <option value="Dining">🍕 Dining</option>
                <option value="Transport">🚗 Transport</option>
                <option value="Utilities">⚡ Utilities</option>
                <option value="Entertainment">🎮 Entertainment</option>
                <option value="Travel">✈️ Travel</option>
              </select>
            </div>

            <div className="field-group">
              <label>Split Between (comma separated usernames)</label>
              <input
                type="text"
                name="splitBetween"
                placeholder="e.g. dushyant_s, john_v"
                value={formData.splitBetween}
                onChange={handleChange}
              />
            </div>
            {/* Date */}
            <div className="field-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Buttons */}
            <div style={styles.btnRow}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/expenses')}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 32px', marginTop: 0 }} disabled={loading}>
                {loading ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const styles = {
  btnRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
};

export default AddExpense;
