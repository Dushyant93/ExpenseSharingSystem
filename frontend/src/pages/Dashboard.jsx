import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const navigate  = useNavigate();
  const username  = localStorage.getItem('username') || 'User';

  const [groups,   setGroups  ] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading,  setLoading ] = useState(true);

  // Load groups and expenses when page opens
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch both groups and expenses at once
        const [groupsRes, expensesRes] = await Promise.all([
          axios.get('/api/groups',   config),
          axios.get('/api/expenses', config),
        ]);

        setGroups(groupsRes.data);
        setExpenses(expensesRes.data);
      } catch (err) {
        // If token expired, send back to login
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Calculate total amount spent
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">

        {/* Welcome header */}
        <div className="page-header">
          <div>
            <h2>👋 Welcome back, {username}!</h2>
            <p>Here's a summary of your shared expenses</p>
          </div>
        </div>

        {/* Stats row */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🏷️</div>
            <div style={styles.statNum}>{groups.length}</div>
            <div style={styles.statLabel}>Active Groups</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💳</div>
            <div style={styles.statNum}>{expenses.length}</div>
            <div style={styles.statLabel}>Total Expenses</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💰</div>
            <div style={styles.statNum}>${totalSpent.toFixed(2)}</div>
            <div style={styles.statLabel}>Total Spent</div>
          </div>
        </div>

        {/* Recent groups */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Your Groups</h3>
            <button className="btn-secondary" onClick={() => navigate('/groups')}>
              View All
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="empty-state">
              <div className="icon">👥</div>
              <p>No groups yet. Create your first group!</p>
              <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => navigate('/groups/add')}>
                Create Group
              </button>
            </div>
          ) : (
            groups.slice(0, 3).map((group) => (
              <div key={group._id} className="card" style={styles.groupCard}
                   onClick={() => navigate('/groups')}>
                <span style={styles.groupIcon}>{group.icon}</span>
                <div>
                  <div style={styles.groupName}>{group.name}</div>
                  <div style={styles.groupDesc}>{group.description || 'No description'}</div>
                </div>
                <span style={{ color: '#AAA', fontSize: '18px' }}>›</span>
              </div>
            ))
          )}
        </div>

        {/* Recent expenses */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Recent Expenses</h3>
            <button className="btn-secondary" onClick={() => navigate('/expenses')}>
              View All
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="empty-state">
              <div className="icon">💸</div>
              <p>No expenses yet. Add your first expense!</p>
              <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => navigate('/expenses/add')}>
                Add Expense
              </button>
            </div>
          ) : (
            expenses.slice(0, 5).map((expense) => (
              <div key={expense._id} className="card">
                <div className="card-row">
                  <div>
                    <div style={styles.expenseDesc}>{expense.description}</div>
                    <div style={styles.expenseMeta}>
                      {expense.groupId?.name || 'No group'} · {expense.category} ·{' '}
                      {new Date(expense.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={styles.amount}>${expense.amount.toFixed(2)}</div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );
};

const styles = {
  statsRow: {
    display:             'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap:                 '12px',
    marginBottom:        '28px',
  },
  statCard: {
    background:   '#fff',
    borderRadius: '12px',
    padding:      '20px',
    textAlign:    'center',
    boxShadow:    '0 1px 4px rgba(0,0,0,0.07)',
  },
  statIcon:  { fontSize: '26px', marginBottom: '8px' },
  statNum:   { fontSize: '26px', fontWeight: 800, color: '#1A1A1A' },
  statLabel: { fontSize: '12px', color: '#666', marginTop: '4px' },
  section:      { marginBottom: '28px' },
  sectionHeader: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   '12px',
  },
  sectionTitle: { fontSize: '16px', fontWeight: 700, color: '#1A1A1A' },
  groupCard: {
    display:    'flex',
    alignItems: 'center',
    gap:        '14px',
    cursor:     'pointer',
  },
  groupIcon:  { fontSize: '28px' },
  groupName:  { fontSize: '14px', fontWeight: 700, color: '#1A1A1A' },
  groupDesc:  { fontSize: '12px', color: '#666', marginTop: '2px' },
  expenseDesc: { fontSize: '14px', fontWeight: 600, color: '#1A1A1A' },
  expenseMeta: { fontSize: '12px', color: '#666', marginTop: '2px' },
  amount:      { fontSize: '16px', fontWeight: 700, color: '#6C3CE1' },
};

export default Dashboard;
