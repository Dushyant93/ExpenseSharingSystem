import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../axiosConfig';
import Navbar from '../../components/Navbar';

const EditExpense = () => {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [formData, setFormData] = useState({
    groupId:      '',
    description:  '',
    amount:       '',
    category:     'General',
    date:         '',
    splitBetween: '',
    splitType:    'equal',
  });
  const [groups,   setGroups  ] = useState([]);
  const [error,    setError   ] = useState('');
  const [loading,  setLoading ] = useState(false);
  const [fetching, setFetching] = useState(true);

  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  // Load groups and existing expense data at the same time
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both in parallel
        const [expenseRes, groupsRes] = await Promise.all([
          axios.get(`/api/expenses/${id}`, authConfig()),
          axios.get('/api/groups', authConfig()),
        ]);

        const exp    = expenseRes.data.data || expenseRes.data;
        const groups = groupsRes.data.data  || groupsRes.data;

        setGroups(groups);

        setFormData({
          groupId:      exp.groupId?._id || exp.groupId || '',
          description:  exp.description  || '',
          amount:       exp.amount        || '',
          category:     exp.category      || 'General',
          date:         exp.date ? exp.date.split('T')[0] : '',
          splitBetween: Array.isArray(exp.splitBetween)
                          ? exp.splitBetween.join(', ')
                          : exp.splitBetween || '',
          splitType:    exp.splitType || 'equal',
        });
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        else setError('Failed to load expense.');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.put(`/api/expenses/${id}`, {
        ...formData,
        splitBetween: formData.splitBetween
          .split(',')
          .map((n) => n.trim())
          .filter((n) => n !== ''),
      }, authConfig());
      navigate('/expenses');
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

        <div className="page-header">
          <div>
            <h2>✏️ Edit Expense</h2>
            <p>Update the expense details</p>
          </div>
        </div>

        <div className="form-card">
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* Group dropdown */}
            <div className="field-group">
              <label>Group</label>
              <select name="groupId" value={formData.groupId} onChange={handleChange} required>
                <option value="">— Select a group —</option>
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>{g.icon} {g.name}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="field-group">
              <label>Description</label>
              <input type="text" name="description" placeholder="e.g. Woolies groceries"
                value={formData.description} onChange={handleChange} required />
            </div>

            {/* Amount */}
            <div className="field-group">
              <label>Amount ($)</label>
              <input type="number" name="amount" placeholder="0.00"
                min="0.01" step="0.01" value={formData.amount} onChange={handleChange} required />
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
              <input type="date" name="date" value={formData.date}
                onChange={handleChange} required />
            </div>

            {/* Split Type - Strategy pattern */}
            <div className="field-group">
              <label>Split Type</label>
              <select name="splitType" value={formData.splitType} onChange={handleChange}>
                <option value="equal">⚖️ Equal Split — everyone pays the same</option>
                <option value="percentage">% Percentage Split — custom percentages</option>
                <option value="exact">💲 Exact Split — specific amounts per person</option>
              </select>
            </div>

            {/* Split Between */}
            <div className="field-group">
              <label>Split Between (comma separated names)</label>
              <input type="text" name="splitBetween"
                placeholder="e.g. Alex, Jessica, Marcus"
                value={formData.splitBetween} onChange={handleChange} />
            </div>

            {/* Buttons */}
            <div style={styles.btnRow}>
              <button type="button" className="btn-secondary"
                onClick={() => navigate('/expenses')}>
                Cancel
              </button>
              <button type="submit" className="btn-primary"
                style={{ width: 'auto', padding: '12px 32px', marginTop: 0 }}
                disabled={loading}>
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
  btnRow: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
};

export default EditExpense;