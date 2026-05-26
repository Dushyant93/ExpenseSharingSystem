import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axiosConfig';
import Navbar from '../../components/Navbar';

const AddExpense = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    groupId:   '',
    description: '',
    amount:    '',
    category:  'General',
    date:      new Date().toISOString().split('T')[0],
    splitType: 'equal',
  });

  const [groups,          setGroups         ] = useState([]);
  const [groupMembers,    setGroupMembers   ] = useState([]); // members of selected group
  const [selectedMembers, setSelectedMembers] = useState([]); // checked members
  const [percentages,     setPercentages    ] = useState({}); // for percentage split
  const [exactAmounts,    setExactAmounts   ] = useState({}); // for exact split
  const [error,           setError          ] = useState('');
  const [loading,         setLoading        ] = useState(false);

  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  // Load groups on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get('/api/groups', authConfig());
        setGroups(res.data.data || res.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      }
    };
    fetchGroups();
  }, [navigate]);

  // When group changes, load its members
  const handleGroupChange = async (e) => {
    const groupId = e.target.value;
    setFormData({ ...formData, groupId });
    setSelectedMembers([]);
    setGroupMembers([]);
    setPercentages({});
    setExactAmounts({});

    if (!groupId) return;

    try {
      const res = await axios.get(`/api/groups/${groupId}`, authConfig());
      const g   = res.data.data || res.data;
      const members = g.members || [];
      setGroupMembers(members);
      // Select all members by default
      setSelectedMembers(members.map((m) => m._id));
    } catch (err) {
      console.error('Failed to load group members');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Toggle a member checkbox
  const toggleMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Update percentage for a member
  const handlePercentageChange = (memberId, value) => {
    setPercentages({ ...percentages, [memberId]: value });
  };

  // Update exact amount for a member
  const handleExactChange = (memberId, value) => {
    setExactAmounts({ ...exactAmounts, [memberId]: value });
  };

  // Calculate equal share preview
  const equalShare = () => {
    if (!formData.amount || selectedMembers.length === 0) return '0.00';
    return (parseFloat(formData.amount) / selectedMembers.length).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedMembers.length === 0) {
      return setError('Please select at least one member to split with.');
    }

    // Build the members array based on split type
    let members = [];
    const selectedMemberObjects = groupMembers.filter((m) =>
      selectedMembers.includes(m._id)
    );

    if (formData.splitType === 'equal') {
      members = selectedMemberObjects.map((m) => m.name);
    } else if (formData.splitType === 'percentage') {
      members = selectedMemberObjects.map((m) => ({
        name:       m.name,
        percentage: parseFloat(percentages[m._id] || 0),
      }));
    } else if (formData.splitType === 'exact') {
      members = selectedMemberObjects.map((m) => ({
        name:   m.name,
        amount: parseFloat(exactAmounts[m._id] || 0),
      }));
    }

    setLoading(true);
    try {
      await axios.post('/api/expenses', {
        ...formData,
        splitBetween: selectedMemberObjects.map((m) => m.name),
        members,
      }, authConfig());
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

        <div className="page-header">
          <div>
            <h2>➕ Add Expense</h2>
            <p>Record a new shared expense</p>
          </div>
        </div>

        <div className="form-card">
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* Group selector */}
            <div className="field-group">
              <label>Group</label>
              <select name="groupId" value={formData.groupId}
                onChange={handleGroupChange} required>
                <option value="">— Select a group —</option>
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>{g.icon} {g.name}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>Description</label>
              <input type="text" name="description"
                placeholder="e.g. Woolies groceries"
                value={formData.description} onChange={handleChange} required />
            </div>

            <div className="field-group">
              <label>Amount ($)</label>
              <input type="number" name="amount" placeholder="0.00"
                min="0.01" step="0.01" value={formData.amount}
                onChange={handleChange} required />
            </div>

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
              <label>Date</label>
              <input type="date" name="date" value={formData.date}
                onChange={handleChange} required />
            </div>

            {/* Split Type */}
            <div className="field-group">
              <label>Split Type</label>
              <select name="splitType" value={formData.splitType} onChange={handleChange}>
                <option value="equal">⚖️ Equal — everyone pays the same</option>
                <option value="percentage">% Percentage — custom percentages</option>
                <option value="exact">💲 Exact — specific amounts per person</option>
              </select>
            </div>

            {/* Member checkboxes — only show if a group is selected */}
            {groupMembers.length > 0 && (
              <div className="field-group">
                <label>Split Between</label>
                <div style={styles.memberList}>
                  {groupMembers.map((member) => (
                    <div key={member._id} style={styles.memberRow}>

                      {/* Checkbox + name */}
                      <div style={styles.memberLeft}>
                        <input
                          type="checkbox"
                          id={member._id}
                          checked={selectedMembers.includes(member._id)}
                          onChange={() => toggleMember(member._id)}
                          style={styles.checkbox}
                        />
                        <div style={styles.memberAvatar}>
                          {member.name?.charAt(0).toUpperCase()}
                        </div>
                        <label htmlFor={member._id} style={styles.memberName}>
                          {member.name}
                          <span style={styles.memberEmail}>{member.email}</span>
                        </label>
                      </div>

                      {/* Percentage input */}
                      {formData.splitType === 'percentage' &&
                        selectedMembers.includes(member._id) && (
                          <div style={styles.splitInput}>
                            <input
                              type="number" min="0" max="100" step="0.1"
                              placeholder="%"
                              value={percentages[member._id] || ''}
                              onChange={(e) => handlePercentageChange(member._id, e.target.value)}
                              style={styles.splitInputField}
                            />
                            <span style={styles.splitInputLabel}>%</span>
                          </div>
                        )}

                      {/* Exact amount input */}
                      {formData.splitType === 'exact' &&
                        selectedMembers.includes(member._id) && (
                          <div style={styles.splitInput}>
                            <span style={styles.splitInputLabel}>$</span>
                            <input
                              type="number" min="0" step="0.01"
                              placeholder="0.00"
                              value={exactAmounts[member._id] || ''}
                              onChange={(e) => handleExactChange(member._id, e.target.value)}
                              style={styles.splitInputField}
                            />
                          </div>
                        )}

                      {/* Equal split preview per member */}
                      {formData.splitType === 'equal' &&
                        selectedMembers.includes(member._id) && (
                          <div style={styles.equalAmount}>${equalShare()}</div>
                        )}

                    </div>
                  ))}
                </div>

                {/* Summary */}
                {selectedMembers.length > 0 && formData.amount && (
                  <div style={styles.summary}>
                    {formData.splitType === 'equal' && (
                      <span>
                        {selectedMembers.length} people · <strong>${equalShare()}</strong> each
                      </span>
                    )}
                    {formData.splitType === 'percentage' && (
                      <span>
                        Total: {Object.values(percentages).reduce((s, v) => s + parseFloat(v || 0), 0).toFixed(1)}%
                        {Object.values(percentages).reduce((s, v) => s + parseFloat(v || 0), 0) !== 100 && (
                          <span style={{ color: '#EF4444' }}> (must equal 100%)</span>
                        )}
                      </span>
                    )}
                    {formData.splitType === 'exact' && (
                      <span>
                        Allocated: ${Object.values(exactAmounts).reduce((s, v) => s + parseFloat(v || 0), 0).toFixed(2)}
                        {' '}of ${parseFloat(formData.amount || 0).toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Prompt to select group first */}
            {!formData.groupId && (
              <div style={styles.groupPrompt}>
                👆 Select a group first to see members
              </div>
            )}

            <div style={styles.btnRow}>
              <button type="button" className="btn-secondary"
                onClick={() => navigate('/expenses')}>
                Cancel
              </button>
              <button type="submit" className="btn-primary"
                style={{ width: 'auto', padding: '12px 32px', marginTop: 0 }}
                disabled={loading}>
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
  memberList: {
    background: '#F7F7F7',
    borderRadius: '10px',
    border: '1.5px solid #E0E0E0',
    overflow: 'hidden',
    marginTop: '6px',
  },
  memberRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid #EEEEEE',
    background: '#fff',
  },
  memberLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    accentColor: '#6C3CE1',
  },
  memberAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#6C3CE1',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '12px',
    flexShrink: 0,
  },
  memberName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1A1A1A',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
  },
  memberEmail: {
    fontSize: '11px',
    color: '#AAA',
    fontWeight: 400,
  },
  splitInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  splitInputField: {
    width: '70px',
    padding: '6px 8px',
    background: '#F7F7F7',
    border: '1.5px solid #E0E0E0',
    borderRadius: '8px',
    fontFamily: 'inherit',
    fontSize: '13px',
    outline: 'none',
    textAlign: 'right',
  },
  splitInputLabel: {
    fontSize: '13px',
    color: '#666',
    fontWeight: 600,
  },
  equalAmount: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#22C55E',
  },
  summary: {
    background: '#F3EEFF',
    borderRadius: '0 0 10px 10px',
    padding: '8px 14px',
    fontSize: '12px',
    color: '#6C3CE1',
    fontWeight: 600,
  },
  groupPrompt: {
    textAlign: 'center',
    padding: '16px',
    color: '#AAA',
    fontSize: '13px',
    background: '#F7F7F7',
    borderRadius: '10px',
    marginBottom: '12px',
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
};

export default AddExpense;