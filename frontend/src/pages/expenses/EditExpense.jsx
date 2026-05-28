import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../axiosConfig';
import Navbar from '../../components/Navbar';

const EditExpense = () => {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [formData, setFormData] = useState({
    groupId:     '',
    description: '',
    amount:      '',
    category:    'General',
    date:        '',
    splitType:   'equal',
  });

  const [groups,          setGroups         ] = useState([]);
  const [groupMembers,    setGroupMembers   ] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);  // array of _id strings
  const [percentages,     setPercentages    ] = useState({});  // { memberId: value }
  const [exactAmounts,    setExactAmounts   ] = useState({});  // { memberId: value }
  const [error,           setError          ] = useState('');
  const [loading,         setLoading        ] = useState(false);
  const [fetching,        setFetching       ] = useState(true);

  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  // Load expense + groups + group members on mount, then pre-populate split fields
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expenseRes, groupsRes] = await Promise.all([
          axios.get(`/api/expenses/${id}`, authConfig()),
          axios.get('/api/groups', authConfig()),
        ]);

        const exp        = expenseRes.data.data || expenseRes.data;
        const groupsList = groupsRes.data.data  || groupsRes.data;

        setGroups(groupsList);

        setFormData({
          groupId:     exp.groupId?._id || exp.groupId || '',
          description: exp.description  || '',
          amount:      exp.amount        || '',
          category:    exp.category      || 'General',
          date:        exp.date ? exp.date.split('T')[0] : '',
          splitType:   exp.splitType     || 'equal',
        });

        // Load members of the expense's group so we can show checkboxes
        const gId = exp.groupId?._id || exp.groupId;
        if (gId) {
          const groupRes  = await axios.get(`/api/groups/${gId}`, authConfig());
          const groupData = groupRes.data.data || groupRes.data;
          const members   = groupData.members || [];
          setGroupMembers(members);

          // Pre-tick members that were in splitBetween
          const savedNames = Array.isArray(exp.splitBetween) ? exp.splitBetween : [];
          const preTicked  = members
            .filter((m) => savedNames.includes(m.name))
            .map((m) => m._id);
          setSelectedMembers(preTicked);

          // Pre-populate percentages / exact amounts from saved splitResult
          if (exp.splitResult && exp.splitResult.length > 0) {
            const pcts   = {};
            const exacts = {};

            exp.splitResult.forEach((split) => {
              const match = members.find((m) => m.name === split.member);
              if (!match) return;

              if (exp.splitType === 'percentage') {
                // Back-calculate percentage from stored dollar amount
                pcts[match._id] = parseFloat(
                  ((split.amount / exp.amount) * 100).toFixed(1)
                );
              } else if (exp.splitType === 'exact') {
                exacts[match._id] = split.amount;
              }
            });

            setPercentages(pcts);
            setExactAmounts(exacts);
          }
        }
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

  // When group is changed manually, reload members and clear split selections
  const handleGroupChange = async (e) => {
    const groupId = e.target.value;
    setFormData({ ...formData, groupId });
    setSelectedMembers([]);
    setGroupMembers([]);
    setPercentages({});
    setExactAmounts({});

    if (!groupId) return;

    try {
      const res     = await axios.get(`/api/groups/${groupId}`, authConfig());
      const g       = res.data.data || res.data;
      const members = g.members || [];
      setGroupMembers(members);
      // Select all members by default when group changes
      setSelectedMembers(members.map((m) => m._id));
    } catch (err) {
      console.error('Failed to load group members');
    }
  };

  const toggleMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handlePercentageChange = (memberId, value) => {
    setPercentages({ ...percentages, [memberId]: value });
  };

  const handleExactChange = (memberId, value) => {
    setExactAmounts({ ...exactAmounts, [memberId]: value });
  };

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

    // Build members array in the shape the Strategy pattern expects
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
      await axios.put(`/api/expenses/${id}`, {
        ...formData,
        splitBetween: selectedMemberObjects.map((m) => m.name),
        members,
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
              <select name="groupId" value={formData.groupId}
                onChange={handleGroupChange} required>
                <option value="">— Select a group —</option>
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>{g.icon} {g.name}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="field-group">
              <label>Description</label>
              <input type="text" name="description"
                placeholder="e.g. Woolies groceries"
                value={formData.description} onChange={handleChange} required />
            </div>

            {/* Amount */}
            <div className="field-group">
              <label>Amount ($)</label>
              <input type="number" name="amount" placeholder="0.00"
                min="0.01" step="0.01" value={formData.amount}
                onChange={handleChange} required />
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

            {/* Split Type */}
            <div className="field-group">
              <label>Split Type</label>
              <select name="splitType" value={formData.splitType} onChange={handleChange}>
                <option value="equal">⚖️ Equal — everyone pays the same</option>
                <option value="percentage">% Percentage — custom percentages</option>
                <option value="exact">💲 Exact — specific amounts per person</option>
              </select>
            </div>

            {/* Member checkboxes — same UI as AddExpense */}
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
                          id={`edit-${member._id}`}
                          checked={selectedMembers.includes(member._id)}
                          onChange={() => toggleMember(member._id)}
                          style={styles.checkbox}
                        />
                        <div style={styles.memberAvatar}>
                          {member.name?.charAt(0).toUpperCase()}
                        </div>
                        <label htmlFor={`edit-${member._id}`} style={styles.memberName}>
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
                              onChange={(e) =>
                                handlePercentageChange(member._id, e.target.value)
                              }
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
                              onChange={(e) =>
                                handleExactChange(member._id, e.target.value)
                              }
                              style={styles.splitInputField}
                            />
                          </div>
                        )}

                      {/* Equal split preview */}
                      {formData.splitType === 'equal' &&
                        selectedMembers.includes(member._id) && (
                          <div style={styles.equalAmount}>${equalShare()}</div>
                        )}

                    </div>
                  ))}
                </div>

                {/* Summary bar */}
                {selectedMembers.length > 0 && formData.amount && (
                  <div style={styles.summary}>
                    {formData.splitType === 'equal' && (
                      <span>
                        {selectedMembers.length} people ·{' '}
                        <strong>${equalShare()}</strong> each
                      </span>
                    )}
                    {formData.splitType === 'percentage' && (
                      <span>
                        Total:{' '}
                        {Object.values(percentages)
                          .reduce((s, v) => s + parseFloat(v || 0), 0)
                          .toFixed(1)}
                        %
                        {Object.values(percentages).reduce(
                          (s, v) => s + parseFloat(v || 0), 0
                        ) !== 100 && (
                          <span style={{ color: '#EF4444' }}> (must equal 100%)</span>
                        )}
                      </span>
                    )}
                    {formData.splitType === 'exact' && (
                      <span>
                        Allocated: $
                        {Object.values(exactAmounts)
                          .reduce((s, v) => s + parseFloat(v || 0), 0)
                          .toFixed(2)}{' '}
                        of ${parseFloat(formData.amount || 0).toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Prompt if no group selected */}
            {!formData.groupId && (
              <div style={styles.groupPrompt}>
                👆 Select a group to see members
              </div>
            )}

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

export default EditExpense;