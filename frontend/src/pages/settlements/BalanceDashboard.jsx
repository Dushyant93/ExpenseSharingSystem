// Balance Dashboard Page
// Shows calculated balances for a group using the Facade pattern on the backend

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../axiosConfig';
import Navbar from '../../components/Navbar';

const BalanceDashboard = () => {
  const navigate   = useNavigate();
  const { groupId } = useParams();

  const [data,    setData   ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState('');

  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const res = await axios.get(`/api/settlements/balances/${groupId}`, authConfig());
        setData(res.data.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        else setError('Failed to load balances.');
      } finally {
        setLoading(false);
      }
    };
    fetchBalances();
  }, [groupId, navigate]);

  if (loading) return <><Navbar /><div className="loading">Calculating balances...</div></>;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h2>⚖️ Group Balances</h2>
            <p>Who owes whom in this group</p>
          </div>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 20px', marginTop: 0 }}
            onClick={() => navigate(`/settlements/add/${groupId}`)}
          >
            + Record Settlement
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {data && (
          <>
            {/* Summary stats */}
            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>💳</div>
                <div style={styles.statNum}>{data.expenses?.length || 0}</div>
                <div style={styles.statLabel}>Expenses</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>🤝</div>
                <div style={styles.statNum}>{data.settlements?.length || 0}</div>
                <div style={styles.statLabel}>Settlements</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>💰</div>
                <div style={styles.statNum}>${data.totalExpenses?.toFixed(2) || '0.00'}</div>
                <div style={styles.statLabel}>Total Spent</div>
              </div>
            </div>

            {/* Balance map */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Net Balances</h3>
              <p style={styles.sectionSub}>Positive = owed money &nbsp;·&nbsp; Negative = owes money</p>

              {Object.entries(data.balances || {}).length === 0 ? (
                <div className="empty-state">
                  <div className="icon">✅</div>
                  <p>All settled up! No outstanding balances.</p>
                </div>
              ) : (
                Object.entries(data.balances).map(([member, amount]) => (
                  <div key={member} className="card">
                    <div className="card-row">
                      <div style={styles.memberInfo}>
                        <div style={styles.avatar}>{member.charAt(0).toUpperCase()}</div>
                        <span style={styles.memberName}>{member}</span>
                      </div>
                      <div style={{
                        fontSize: '18px', fontWeight: 700,
                        color: amount >= 0 ? '#22C55E' : '#EF4444',
                      }}>
                        {amount >= 0 ? '+' : ''}{amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recent settlements */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Settlement History</h3>
                <button className="btn-secondary" onClick={() => navigate(`/settlements/${groupId}`)}>
                  View All
                </button>
              </div>
              {data.settlements?.length === 0 ? (
                <p style={{ color: '#AAA', fontSize: '13px' }}>No settlements recorded yet.</p>
              ) : (
                data.settlements?.slice(0, 3).map((s) => (
                  <div key={s._id} className="card">
                    <div className="card-row">
                      <div>
                        <div style={styles.settleDesc}>
                          {s.paidBy?.name} paid {s.paidTo?.name}
                        </div>
                        <div style={styles.settleDate}>{new Date(s.date).toLocaleDateString('en-AU')}</div>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#6C3CE1' }}>
                        ${s.amount?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

const styles = {
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' },
  statCard:  { background: '#fff', borderRadius: '12px', padding: '18px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.07)' },
  statIcon:  { fontSize: '24px', marginBottom: '6px' },
  statNum:   { fontSize: '22px', fontWeight: 800, color: '#1A1A1A' },
  statLabel: { fontSize: '11px', color: '#666', marginTop: '3px' },
  section:       { marginBottom: '24px' },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' },
  sectionTitle:  { fontSize: '15px', fontWeight: 700, color: '#1A1A1A' },
  sectionSub:    { fontSize: '12px', color: '#AAA', marginBottom: '12px' },
  memberInfo:  { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:      { width: '36px', height: '36px', borderRadius: '50%', background: '#6C3CE1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' },
  memberName:  { fontSize: '14px', fontWeight: 600, color: '#1A1A1A' },
  settleDesc:  { fontSize: '14px', fontWeight: 600, color: '#1A1A1A' },
  settleDate:  { fontSize: '12px', color: '#AAA', marginTop: '2px' },
};

export default BalanceDashboard;
