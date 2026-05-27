const Group = require('../models/Group');

// GET ALL GROUPS
// Returns all groups where the logged-in user is a member
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id })
      .populate('createdBy', 'username') // creator's username
      .sort({ createdAt: -1 });          // sort by the newest first
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE GROUP
// Returns one group by its ID
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
    .populate('createdBy', 'username')
    .populate('members', 'name email');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE GROUP
// Creates a new group and adds creator as first member
const createGroup = async (req, res) => {
  const { name, description, icon, memberIds } = req.body;
  try {
    // Start with creator, then add any extra members
    const allMembers = [req.user.id];
    if (memberIds && Array.isArray(memberIds)) {
      memberIds.forEach((id) => {
        if (id !== req.user.id.toString()) {
          allMembers.push(id);
        }
      });
    }
    const group = await Group.create({
      name, description, icon,
      createdBy: req.user.id,
      members: allMembers,
    });
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE GROUP
// Updates an existing group by ID
const updateGroup = async (req, res) => {
  const { name, description, icon } = req.body;
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Only update fields that were sent in the request
    group.name        = name        || group.name;
    group.description = description ?? group.description;
    group.icon        = icon        || group.icon;

    const updatedGroup = await group.save();
    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE GROUP
// Deletes a group by ID (only creator can delete)
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    await group.deleteOne();
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD MEMBER TO GROUP - POST /api/groups/:id/members
const addMember = async (req, res) => {
  const { email } = req.body;
  try {
    // Find the user by email
    const User  = require('../models/User');
    const user  = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user found with that email' });

    // Find the group
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check if already a member
    const alreadyMember = group.members.some(
      (m) => m.toString() === user._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this group' });
    }

    // Add the user to members
    group.members.push(user._id);
    await group.save();

    res.json({ message: `${user.name} added to the group successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getGroups, getGroupById, createGroup, updateGroup, deleteGroup, addMember };
