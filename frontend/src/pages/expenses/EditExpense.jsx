// EditExpense Page - form to update an existing expense
// Loads the current expense data and pre-fills the form

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const EditExpense = () => {
  const navigate    = useNavigate();
  const { id }      = useParams(); // expense ID from URL

  const [formData, setFormData] = useState({
    description: '',
    amount:      '',
    category:    'General',
    date:        '',
  });
  const [error,   setError  ] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // It's an Helper to attach JWT to every request
  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  // Load existing expense data to pre-fill the form
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await axios.get(`/api/expenses/${id}`, authConfig());
        const exp = res.data;
        setFormData({
          description: exp.description,
          amount:      exp.amount,
          category:    exp.category,
          date:        exp.date.split('T')[0], // format as YYYY-MM-DD for input
        });
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        else setError('Failed to load expense.');
      } finally {
        setFetching(false);
      }
    };
    fetchExpense();
  }, [id, navigate]);

  // Update state when user types
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit updated data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.put(`/api/expenses/${id}`, formData, authConfig());
      navigate('/expenses'); // go back to list after saving
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update expense.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <><Navbar /><div className="loading">Loading expense...</div></>;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2>✏️ Edit Expense</h2>
            <p>Update the expense details</p>
          </div>
        </div>

        <div className="form-card">
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>

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

            {/* Amount. */}
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
  btnRow: {
    display:        'flex',
    justifyContent: 'flex-end',
    gap:            '12px',
    marginTop:      '24px',
  },
};

export default EditExpense;
