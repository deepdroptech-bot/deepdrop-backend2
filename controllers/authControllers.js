const User = require("../models/usermodel");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
};

// Registration Controller
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    // 1. Check required fields
    if (!name || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // 2. Reconfirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    // 3. Validate role
    const allowedRoles = ["admin", "manager", "accountant"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    // 4. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // 5. Create user (password hashed automatically)
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    res.status(201).json({
      msg: "User created successfully",
      user
    });
  } catch (error) {
    res.status(500).json({ msg: "Failed to create user" });
  }
};

// Login Controller
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ msg: "User not found or inactive" });
    }

    // 2. Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ msg: "password is incorrect" });
    }

    // 3. Generate token
    const token = generateToken(user);

    res.json({
      msg: "Login successful",
      user,
      token
    });
  } catch (error) {
    res.status(500).json({ msg: "Login failed" });
  }
};

// Get Current User 
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch user" });
  }
};

//get all users(admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch users" });
  }
};

//get user by id (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch user" });
  }
};

//edit user by id (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, password, confirmPassword, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isActive === "boolean") user.isActive = isActive;

    // If password is being changed
    if (password) {
      if (!confirmPassword) {
        return res.status(400).json({ msg: "Confirm password required" });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ msg: "Passwords do not match" });
      }

      user.password = password; // hashed by pre-save hook
    }

    await user.save();

    res.json({ msg: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ msg: "Failed to update user" });
  }
};

//edit current user
exports.updateCurrentUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    // If password is being changed
    if (password) {
      if (!confirmPassword) {
        return res.status(400).json({ msg: "Confirm password required" });
      }
        if (password !== confirmPassword) { 
        return res.status(400).json({ msg: "Passwords do not match" });
    } 
        user.password = password; // hashed by pre-save hook
    }
    await user.save();
    res.json({ msg: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ msg: "Failed to update profile" });
  }
};

// Delete User (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await user.deleteOne();

    res.json({ msg: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to delete user" });
  }
};


// Logout Controller
exports.logoutUser = async (req, res) => {
  try {
    // For JWT, logout is handled on client side by deleting the token
    res.json({ msg: "Logout successful" });
  } catch (error) {
    res.status(500).json({ msg: "Logout failed" });
  }
};

