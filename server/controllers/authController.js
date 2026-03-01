const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { Op } = require('sequelize');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: email.toLowerCase() },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      role: 'user'
    });

    const token = generateToken({ id: user.id, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      accessToken: token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

exports.adminPing = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: '✅ Admin route access granted',
    user: req.user.toPublicJSON()
  });
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json({
      success: true,
      users: users.map((u) => u.toPublicJSON())
    });
  } catch (error) {
    console.error('GetAllUsers Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
};

exports.makeAdmin = async (req, res) => {
  try {
    if ((process.env.NODE_ENV || 'development') === 'production') {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ role: 'admin' });

    return res.status(200).json({
      success: true,
      message: 'User promoted to admin',
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('MakeAdmin Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to promote user'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken: token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('GetProfile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};
