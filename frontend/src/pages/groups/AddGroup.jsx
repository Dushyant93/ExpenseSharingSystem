// AddGroup Page - Updated
// Allows adding members by email while creating the group

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axiosConfig';
import Navbar from '../../components/Navbar';

const AddGroup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', description: '', icon: '👥' });
  const [members,      setMembers     ] = useState([]); // list of user objects to add
  const [memberEmail,  setMemberEmail ] = useState('');
  const [memberMsg,    setMemberMsg   ] = useState('');
  const [memberErr,    setMemberErr   ] = useState('');
  const [searching,    setSearching   ] = useState(false);
  const [error,        setError       ] = useState('');
  const [loading,      setLoading     ] = useState(false);

  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Search for a user by email and add them to the local list
  const handleAddMember = async () => {
    setMemberErr('');
    setMemberMsg('');

    if (!memberEmail.trim()) return;

    // Check not already added
    const alreadyAdded = members.some((m) => m.email === memberEmail.trim());
    if (alreadyAdded) {
      setMemberErr('This person is already in the list.');
      return;
    }

    setSearching(true);
    try {
      // Search for user by email using the search endpoint
      const res = await axios.get(
        `/api/auth/search?email=${encodeURIComponent(memberEmail.trim())}`,
        authConfig()
      );
      const user = res.data.data || res.data;
      setMembers([...members, user]);
      setMemberMsg(`${user.name} added to the group.`);
      setMemberEmail('');
    } catch (err) {
      if (err.response?.status === 404) {
        setMemberErr('No account found with that email. They must register first.');
      } else {
        setMemberErr(err.response?.data?.message || 'Failed to find user.');
      }
    } finally {
      setSearching(false);
    }
  };

  // Remove a member from the local list before submitting
  const removeMember = (email) => {
    setMembers(members.filter((m) => m.email !== email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Create the group first
      const res = await axios.post('/api/groups', {
        ...formData,
        // Pass member IDs so the backend can add them during creation
        memberIds: members.map((m) => m._id),
      }, authConfig());

      navigate('/groups');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group.');
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
            <h2>➕ Create Group</h2>
            <p>Start a new expense sharing group</p>
          </div>
        </div>

        <div className="form-card">
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>

            <div className="field-group">
              <label>Group Icon</label>
              <select name="icon" value={formData.icon} onChange={handleChange}>
                <option value="🏠">🏠 House</option>
                <option value="🏖️">🏖️ Holiday</option>
                <option value="🍕">🍕 Food & Dining</option>
                <option value="🎮">🎮 Gaming</option>
                <option value="✈️">✈️ Travel</option>
                <option value="🎉">🎉 Events</option>
                <option value="💼">💼 Work</option>
                <option value="👥">👥 General</option>
              </select>
            </div>

            <div className="field-group">
              <label>Group Name</label>
              <input type="text" name="name"
                placeholder="e.g. Brisbane Flat, Bali Trip 2026"
                value={formData.name} onChange={handleChange} required />
            </div>

            <div className="field-group">
              <label>Description (optional)</label>
              <textarea name="description" placeholder="What is this group for?"
                value={formData.description} onChange={handleChange} />
            </div>

            {/* Add members section */}
            <div className="field-group">
              <label>Add Members (optional)</label>
              <p style={styles.hint}>
                Search by email to add members now. You can also add more members later by editing the group.
              </p>

              {/* Search input */}
              <div style={styles.searchRow}>
                <input
                  type="email"
                  placeholder="Enter member's registered email"
                  value={memberEmail}
                  onChange={(e) => {
                    setMemberEmail(e.target.value);
                    setMemberErr('');
                    setMemberMsg('');
                  }}
                  style={{ flex: 1 }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMember())}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flexShrink: 0 }}
                  onClick={handleAddMember}
                  disabled={searching || !memberEmail.trim()}
                >
                  {searching ? 'Searching...' : 'Add'}
                </button>
              </div>

              {memberMsg && <div className="success-msg" style={styles.feedback}>{memberMsg}</div>}
              {memberErr && <div className="error-msg"   style={styles.feedback}>{memberErr}</div>}

              {/* Members list */}
              {members.length > 0 && (
                <div style={styles.memberList}>
                  {members.map((m) => (
                    <div key={m._id} style={styles.memberRow}>
                      <div style={styles.memberLeft}>
                        <div style={styles.avatar}>
                          {m.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={styles.memberName}>{m.name}</div>
                          <div style={styles.memberEmail}>{m.email}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMember(m.email)}
                        style={styles.removeBtn}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <div style={styles.memberCount}>
                    {members.length} member{members.length !== 1 ? 's' : ''} added
                    {' '}(you will be added automatically as the creator)
                  </div>
                </div>
              )}
            </div>

            <div style={styles.btnRow}>
              <button type="button" className="btn-secondary"
                onClick={() => navigate('/groups')}>
                Cancel
              </button>
              <button type="submit" className="btn-primary"
                style={{ width: 'auto', padding: '12px 32px', marginTop: 0 }}
                disabled={loading}>
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

const styles = {
  hint:       { fontSize: '12px', color: '#AAA', marginBottom: '10px' },
  searchRow:  { display: 'flex', gap: '8px', marginBottom: '8px' },
  feedback:   { marginTop: '6px', marginBottom: '0' },
  memberList: {
    background: '#fff', borderRadius: '10px',
    border: '1.5px solid #E0E0E0', overflow: 'hidden', marginTop: '10px',
  },
  memberRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px', borderBottom: '1px solid #F0F0F0',
  },
  memberLeft:  { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: '#6C3CE1', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: '13px', flexShrink: 0,
  },
  memberName:  { fontSize: '13px', fontWeight: 700, color: '#1A1A1A' },
  memberEmail: { fontSize: '11px', color: '#AAA', marginTop: '1px' },
  removeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#EF4444', fontSize: '14px', fontWeight: 700,
    padding: '4px 8px', borderRadius: '6px',
  },
  memberCount: {
    padding: '8px 14px', fontSize: '11px',
    color: '#6C3CE1', background: '#F3EEFF', fontWeight: 600,
  },
  btnRow: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
};

export default AddGroup;