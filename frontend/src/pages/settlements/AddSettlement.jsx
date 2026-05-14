// Add Settlement Page
// Records when one group member pays back another

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../axiosConfig';
import Navbar from '../../components/Navbar';

const AddSettlement = () => {
  const navigate   = useNavigate();
  const { groupId } = useParams();

  const [formData, setFormData] = useState({
    paidTo: '',
    amount: '',
    note:   '',
    date:   new Date().toISOString().split('T')[0],
  });
  const [members, setMembers ] = useState([]);
  const [error,   setError  ] = useState('');
  const [loading, setLoading] = useState(false);

  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  // Load group members for the dropdown
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(`/api/groups/${groupId}`, authConfig());
        const group = res.data.data || res.data;
        setMembers(group.members || []);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      }
    };
    fetchGroup();
  }, [groupId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/settlements', { groupId, ...formData }, authConfig());
      navigate(`/settlements/balances/${groupId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record settlement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h2>🤝 Record Settlement</h2>
            <p>Record a payment between group members</p>
          </div>
        </div>

        <div className="form-card">
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>

            <div className="field-group">
              <label>Paid To (who received the money)</label>
              <select name="paidTo" value={formData.paidTo} onChange={handleChange} required>
                <option value="">— Select member —</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>Amount ($)</label>
              <input type="number" name="amount" placeholder="0.00"
                min="0.01" step="0.01" value={formData.amount} onChange={handleChange} required />
            </div>

            <div className="field-group">
              <label>Note (optional)</label>
              <input type="text" name="note" placeholder="e.g. Rent payment for March"
                value={formData.note} onChange={handleChange} />
            </div>

            <div className="field-group">
              <label>Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>

            <div style={styles.btnRow}>
              <button type="button" className="btn-secondary"
                onClick={() => navigate(`/settlements/balances/${groupId}`)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary"
                style={{ width: 'auto', padding: '12px 32px', marginTop: 0 }} disabled={loading}>
                {loading ? 'Saving...' : 'Record Settlement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const styles = {
  btnRow: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
};

export default AddSettlement;
