// ExpenseList Page - shows all expenses for the logged-in user
// Allows editing and deleting each expense

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const ExpenseList = () => {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [loading,  setLoading ] = useState(true);
  const [error,    setError   ] = useState('');

  // It's an helper to attach JWT to every request - same pattern as starter project
  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  // Load all expenses when page opens
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/api/expenses', authConfig());
      setExpenses(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else setError('Failed to load expenses.');
    } finally {
      setLoading(false);
    }
  };

  // Delete an expense by ID
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await axios.delete(`/api/expenses/${id}`, authConfig());
      // Remove from local state without re-fetching
      setExpenses(expenses.filter((e) => e._id !== id));
    } catch (err) {
      setError('Failed to delete expense.');
    }
  };

  // Category badge colour
  const categoryColor = {
    Groceries:     'badge-green',
    Dining:        'badge-purple',
    Transport:     'badge-purple',
    Utilities:     'badge-red',
    Entertainment: 'badge-purple',
    Travel:        'badge-green',
    General:       'badge-purple',
  };

  if (loading) return <><Navbar /><div className="loading">Loading expenses...</div></>;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2>💳 Expenses</h2>
            <p>{expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded</p>
          </div>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 20px', marginTop: 0 }}
            onClick={() => navigate('/expenses/add')}
          >
            + Add Expense
          </button>
        </div>

        {/* Error */}
        {error && <div className="error-msg">{error}</div>}

        {/* Empty state */}
        {expenses.length === 0 ? (
          <div className="empty-state">
            <div className="icon">💸</div>
            <p>No expenses yet. Add your first one!</p>
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '10px 24px' }}
              onClick={() => navigate('/expenses/add')}
            >
              Add Expense
            </button>
          </div>
        ) : (
          expenses.map((expense) => (
            <div key={expense._id} className="card">
              <div className="card-row">
                {/* Left: description and meta */}
                <div style={{ flex: 1 }}>
                  <div style={styles.desc}>{expense.description}</div>
                  <div style={styles.meta}>
                    <span className={`badge ${categoryColor[expense.category] || 'badge-purple'}`}>
                      {expense.category}
                    </span>
                    <span style={styles.dot}>·</span>
                    <span>{expense.groupId?.name || 'No group'}</span>
                    <span style={styles.dot}>·</span>
                    <span>{new Date(expense.date).toLocaleDateString('en-AU')}</span>
                  </div>
                </div>

                {/* Right: amount and action buttons */}
                <div style={styles.right}>
                  <div style={styles.amount}>${expense.amount.toFixed(2)}</div>
                  <div className="card-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => navigate(`/expenses/edit/${expense._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(expense._id)}
                    >
                      Delete
                    </button>
                  </div>
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
  desc:   { fontSize: '14px', fontWeight: 700, color: '#1A1A1A', marginBottom: '6px' },
  meta:   { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#666' },
  dot:    { color: '#CCC' },
  right:  { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },
  amount: { fontSize: '18px', fontWeight: 800, color: '#6C3CE1' },
};

export default ExpenseList;
