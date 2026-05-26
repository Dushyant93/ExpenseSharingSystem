// Settlement List Page - full settlement history for a group

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../axiosConfig';
import Navbar from '../../components/Navbar';

const SettlementList = () => {
  const navigate    = useNavigate();
  const { groupId } = useParams();

  const [settlements, setSettlements] = useState([]);
  const [loading,     setLoading    ] = useState(true);
  const [error,       setError      ] = useState('');

  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        const res = await axios.get(`/api/settlements/group/${groupId}`, authConfig());
        setSettlements(res.data.data || []);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        else setError('Failed to load settlements.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettlements();
  }, [groupId, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this settlement?')) return;
    try {
      await axios.delete(`/api/settlements/${id}`, authConfig());
      setSettlements(settlements.filter((s) => s._id !== id));
    } catch (err) {
      setError('Failed to delete settlement.');
    }
  };

  if (loading) return <><Navbar /><div className="loading">Loading settlements...</div></>;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h2>🤝 Settlement History</h2>
            <p>{settlements.length} settlement{settlements.length !== 1 ? 's' : ''} recorded</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={() => navigate(`/settlements/balances/${groupId}`)}>
              View Balances
            </button>
            <button className="btn-primary"
              style={{ width: 'auto', padding: '10px 20px', marginTop: 0 }}
              onClick={() => navigate(`/settlements/add/${groupId}`)}>
              + Record Settlement
            </button>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {settlements.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🤝</div>
            <p>No settlements recorded yet.</p>
            <button className="btn-primary"
              style={{ width: 'auto', padding: '10px 24px' }}
              onClick={() => navigate(`/settlements/add/${groupId}`)}>
              Record First Settlement
            </button>
          </div>
        ) : (
          settlements.map((s) => (
            <div key={s._id} className="card">
              <div className="card-row">
                <div style={{ flex: 1 }}>
                  <div style={styles.desc}>
                    {s.paidBy?.name} paid {s.paidTo?.name}
                  </div>
                  {s.note && <div style={styles.note}>{s.note}</div>}
                  <div style={styles.date}>{new Date(s.date).toLocaleDateString('en-AU')}</div>
                </div>
                <div style={styles.right}>
                  <div style={styles.amount}>${s.amount?.toFixed(2)}</div>
                  <button className="btn-danger" onClick={() => handleDelete(s._id)}>Delete</button>
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
  desc:   { fontSize: '14px', fontWeight: 700, color: '#1A1A1A' },
  note:   { fontSize: '12px', color: '#666', marginTop: '3px' },
  date:   { fontSize: '11px', color: '#AAA', marginTop: '3px' },
  right:  { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },
  amount: { fontSize: '18px', fontWeight: 800, color: '#6C3CE1' },
};

export default SettlementList;
