const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate that all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    // Check if the user already exists in the database
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash the password for security before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user instance
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user' // Default to 'user' role if not specified
    });

    // Save user to MongoDB
    await newUser.save();

    // Send back user details (excluding password)
    return res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // Find the user by their email address
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Compare the entered password with the hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Send back user details if successful
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
};

// Get all users (Admin feature)
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Exclude password hash
    return res.status(200).json(users);
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({ message: 'Unable to retrieve users.' });
  }
};

// Update user details (Admin / User feature)
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ message: 'Failed to update user.' });
  }
};

// Delete a user (Admin feature)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete user from User collection
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Cascading delete: if they are a doctor, delete their profile
    const Doctor = require('../models/Doctor');
    const Appointment = require('../models/Appointment');
    
    await Doctor.deleteOne({ userId });
    
    // Also delete any appointments associated with this user
    await Appointment.deleteMany({
      $or: [
        { userId: userId },
        { doctorId: userId } // If the user was a doctor
      ]
    });

    return res.status(200).json({ message: 'User and associated profiles/appointments deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Failed to delete user.' });
  }
};
