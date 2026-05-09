// controllers/userController.js
import User from "../models/User.js";

export const toggleUserStatus = async (req, res) => {
  try {
    const { user_id, isActive } = req.body;

    const user = await User.findOne({ user_id: Number(user_id) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Toggle status
    user.isActive = !isActive;

    await user.save();

    res.status(200).json({
      message: "User status updated successfully",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getUserList = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0, __v: 0, _id: 0 }).sort({ user_id: 1 });

    res.status(200).json({
      message: "User list fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get user list error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getSingleUser = async (req, res) => {
  try {
    const { user_id } = req.body;

    const user = await User.findOne(
      { user_id: Number(user_id) },
      { _id: 0, password: 0, __v: 0 }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get single user error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { user_id, name, email } = req.body;

    const user = await User.findOne({ user_id: Number(user_id) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Server error or duplicate email" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findOne({ user_id: Number(req.user.userId) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { user_id, role } = req.body;

    const allowedRoles = ["Admin", "Manager", "Cashier"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: "Invalid role. Allowed roles are Admin, Manager, Cashier",
      });
    }

    const user = await User.findOne({ user_id: Number(user_id) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: "User role updated successfully",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Change user role error:", error);
    res.status(500).json({ error: "Server error" });
  }
};