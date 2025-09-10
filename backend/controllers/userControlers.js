import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};
//route for user login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.json({ success: false, message: "Invalid password" });
    }

    if (user.isLocked) {
      return res.json({ success: false, message: "This account has been locked. Please contact administrator." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ 
      success: true, 
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address || {}
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//route for user register
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.json({ 
        success: false, 
        message: "First name and last name are required" 
      });
    }

    //check user already exists or not
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "user already exists" });
    }

    //validating email format && strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "please enter a Strong password",
      });
    }

    //hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    const token = createToken(user.id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//route  for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Toggle lock/unlock user
export const toggleUserLock = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.isLocked = !user.isLocked;
    await user.save();

    res.json({
      success: true,
      message: `User has been ${user.isLocked ? 'locked' : 'unlocked'}`,
      isLocked: user.isLocked
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling user lock status"
    });
  }
};

// Admin change user password
export const adminChangePassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password has been changed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error changing password"
    });
  }
};

// Change user password (for the logged-in user)
export const changeUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.json({ 
        success: false, 
        message: "Current password is incorrect" 
      });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password has been changed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error changing password"
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address } = req.body;
    const userId = req.user.id;

    console.log('Update profile request:', {
      userId,
      body: req.body,
      headers: req.headers
    });

    console.log('Finding user with ID:', userId);
    const user = await userModel.findById(userId);
    
    if (!user) {
      console.log('User not found with ID:', userId);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log('Current user data:', user);

    // Validate email format if changed
    if (email !== user.email) {
      if (!validator.isEmail(email)) {
        return res.json({
          success: false,
          message: "Please enter a valid email"
        });
      }
      // Check if new email already exists
      const emailExists = await userModel.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.json({
          success: false,
          message: "Email already in use"
        });
      }
    }

    // Update user data
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    if (phone !== undefined) {
      user.phone = phone;
    }
    if (address) {
      user.address = {
        street: address.street || '',
        state: address.state || '',
        country: address.country || '',
        zipcode: address.zipcode || '',
        city: address.city || ''
      };
    }

    console.log('Saving updated user data:', {
      firstName,
      lastName,
      email,
      phone,
      address
    });

    const savedUser = await user.save();
    console.log('User saved successfully:', savedUser);

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        phone: savedUser.phone,
        address: savedUser.address
      }
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating profile"
    });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address || {}
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile"
    });
  }
};

export { registerUser, adminLogin };
