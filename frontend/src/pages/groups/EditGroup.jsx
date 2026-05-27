// EditGroup Page - form to update an existing group

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../axiosConfig';
import Navbar from '../../components/Navbar';

const EditGroup = () => {
  const navigate = useNavigate();
  const { id }   = useParams();

  // ALL useState hooks must be inside the component function
  const [formData,     setFormData    ] = useState({ name: '', description: '', icon: '👥' });
  const [members,      setMembers     ] = useState([]);
  const [memberEmail,  setMemberEmail ] = useState('');
  const [memberMsg,    setMemberMsg   ] = useState('');
  const [memberErr,    setMemberErr   ] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [error,        setError       ] = useState('');
  const [loading,      setLoading     ] = useState(false);
  const [fetching,     setFetching    ] = useState(true);

  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.get(`/api/groups/${id}`, authConfig());
        const g   = res.data.data || res.data;
        setFormData({
          name:        g.name,
          description: g.description || '',
          icon:        g.icon || '👥',
        });
        setMembers(g.members || []);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        else setError('Failed to load group.');
      } finally {
        setFetching(false);
      }
    };
    fetchGroup();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddMember = async () => {
    setMemberErr('');
    setMemberMsg('');
    setAddingMember(true);
    try {
      const res = await axios.post(
        `/api/groups/${id}/members`,
        { email: memberEmail },
        authConfig()
      );
      setMemberMsg(res.data.message);
      setMemberEmail('');
      // Reload group to show updated members list
      const updated = await axios.get(`/api/groups/${id}`, authConfig());
      const g = updated.data.data || updated.data;
      setMembers(g.members || []);
    } catch (err) {
      setMemberErr(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setAddingMember(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.put(`/api/groups/${id}`, formData, authConfig());
      navigate('/groups');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update group.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <><Navbar /><div className="loading">Loading group...</div></>;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">

        <div className="page-header">
          <div>
            <h2>✏️ Edit Group</h2>
            <p>Update the group details</p>
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
              <input type="text" name="name" placeholder="e.g. Brisbane Flat"
                value={formData.name} onChange={handleChange} required />
            </div>

            <div className="field-group">
              <label>Description (optional)</label>
              <textarea name="description" placeholder="What is this group for?"
                value={formData.description} onChange={handleChange} />
            </div>

            {/* Current members list */}
            <div className="field-group">
              <label>Current Members</label>
              {members.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#AAA' }}>No members yet.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {members.map((m, index) => (
                    <div key={m._id || index} style={{
                      background: '#F3EEFF', color: '#6C3CE1',
                      padding: '4px 12px', borderRadius: '99px',
                      fontSize: '12px', fontWeight: 600,
                    }}>
                      {m.name || m.email || 'Member'}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add member by email */}
            <div className="field-group">
              <label>Add Member by Email</label>
              {memberMsg && <div className="success-msg" style={{ marginBottom: '8px' }}>{memberMsg}</div>}
              {memberErr && <div className="error-msg"   style={{ marginBottom: '8px' }}>{memberErr}</div>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  placeholder="Enter member's registered email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flexShrink: 0 }}
                  onClick={handleAddMember}
                  disabled={addingMember || !memberEmail}
                >
                  {addingMember ? 'Adding...' : 'Add'}
                </button>
              </div>
              <p style={{ fontSize: '11px', color: '#AAA', marginTop: '5px' }}>
                The person must already have a SettleUp account.
              </p>
            </div>

            <div style={styles.btnRow}>
              <button type="button" className="btn-secondary"
                onClick={() => navigate('/groups')}>
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

export default EditGroup;