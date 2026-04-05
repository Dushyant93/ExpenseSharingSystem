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
    const group = await Group.findById(req.params.id).populate('createdBy', 'username');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE GROUP
// Creates a new group and adds creator as first member
const createGroup = async (req, res) => {
  const { name, description, icon } = req.body;
  try {
    const group = await Group.create({
      name,
      description,
      icon,
      createdBy: req.user.id,        // from JWT middleware - same as tutorial
      members: [req.user.id],        // creator is automatically the first member
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

module.exports = { getGroups, getGroupById, createGroup, updateGroup, deleteGroup };
