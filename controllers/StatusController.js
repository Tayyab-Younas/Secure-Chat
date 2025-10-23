import User from '../models/UserModel.js';


export const getUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('status lastSeen');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      userId: user._id,
      status: user.status,
      lastSeen: user.lastSeen,
    });
  } catch (error) {
    console.error('Error fetching user status:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getOnlineUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'online' }).select('_id name email');
    res.json(users);
  } catch (error) {
    console.error('Error fetching online users:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};