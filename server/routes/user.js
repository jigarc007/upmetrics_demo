const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../schema/user');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');
const crypto = require('crypto'); // ✅ REQUIRED
const sendEmail = require('../utils/sendEmail');
const router = express.Router();

// SIGNUP
router.post(
  '/signup',
  upload.single('profile'),
  async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;
      console.log('sign up REQ BODY:', req.body);
      // ✅ validation
      if (!name || !email || !password) {
        return res.status(400).json({
          message: 'Name, email, and password are required'
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const userData = {
        name,
        email,
        password: hashedPassword,
        phone
      };
      if (req.file) {
        userData.profile = `/uploads/${req.file.filename}`;
      }
      console.log('USER DATA:', userData);
      const user = await User.create(userData);

      res.status(201).json({
        message: 'User registered successfully',
        user
      });

    } catch (err) {
      res.status(500).json({
        message: 'Signup failed',
        error: err.message
      });
    }
  }
);



// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email ,phone: user.phone, profile: user.profile},
      'SECRET_KEY',
      { expiresIn: '1d' }
    );

    res.json({ token, user:{id: user._id, name: user.name, email: user.email ,phone: user.phone, profile: user.profile} });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// UPDATE USER PROFILE
// router.put(
//   '/update',
//   auth,
//   upload.single('profile'),
//   async (req, res) => {
//     try {
//       const updates = {
//         name: req.body.name
//       };

//       if (req.file) {
//         updates.profile = `/uploads/${req.file.filename}`;
//       }

//       const user = await User.findByIdAndUpdate(
//         req.userId,
//         updates,
//         { new: true }
//       );

//       res.json({ message: 'Profile updated', user });
//     } catch (err) {
//       res.status(500).json({ message: 'Update failed', error: err.message });
//     }
//   }
// );
router.put(
  '/update',
  auth,
  upload.single('profile'),
  async (req, res) => {
    try {
      console.log('REQUEST USER:', req.user);
      const updates = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
      };

      if (req.file) {
        updates.profile = `/uploads/${req.file.filename}`;
      }

      const user = await User.findByIdAndUpdate(
        req.user.userId ,
        updates,
        {
          new: true,
          select: '-password -__v', // 🔥 remove sensitive fields
        }
      );
      console.log('UPDATED USER:', user);

      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        });
      }


      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user,
      });

    } catch (err) {
      console.error('Update user error:', err);

      return res.status(500).json({
        success: false,
        message: 'Update failed',
        error: err.message,
      });
    }
  }
);

/**
 * POST /api/auth/forgot-password
 */

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      html: `
        <p>You requested a password reset</p>
        <a href="${resetUrl}">Reset Password</a>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'Reset email sent successfully',
    });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false });
  }
});
/**
 * POST /api/auth/reset-password/:token
 */
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    console.log('RESET PASSWORD REQ BODY:', req.body);

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword; // hash via pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (err) {
    console.error('Reset password error:', err);

    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});


module.exports = router;