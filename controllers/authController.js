// // controllers/authController.js
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// // --- REGISTER LOGIC (Unchanged) ---
// export const registerUser = async (req, res) => {
//   try {
//     const { user_id, name, email, password, role } = req.body;

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({
//       user_id,
//       name,
//       email,
//       password: hashedPassword,
//       role,
//     });
//     await newUser.save(); 
//     res.status(201).json({ message: "User created successfully!" });
//   } catch (error) {
//     res.status(400).json({ error: "Email might exist or something went wrong." });
//   }
// };

// // --- UPGRADED LOGIN LOGIC ---
// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email: email });
//     if (!user) return res.status(401).json({ error: "Invalid email or password" });

//     if (!user.isActive) {
//       return res.status(403).json({ error: "User account is inactive" });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) return res.status(401).json({ error: "Invalid email or password" });

//     // 1. Create the short-lived Access Token (15 minutes)
//     const accessToken = jwt.sign(
//       { userId: user.user_id, email: user.email, role: user.role, isActive: user.isActive }, // Include role for RBAC
//       process.env.JWT_SECRET,
//       { expiresIn: '15m' } 
//     );

//     // 2. Create the long-lived Refresh Token (7 days)
//     const refreshToken = jwt.sign(
//       { userId: user.user_id }, // Keep payload small, just the ID
//       process.env.REFRESH_TOKEN_SECRET,
//       { expiresIn: '7d' } 
//     );

//     // Send BOTH back to the user!
//     res.json({ 
//       message: "Login successful!", 
//       accessToken: accessToken,
//       refreshToken: refreshToken
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // --- NEW: REFRESH TOKEN LOGIC ---
// export const refreshUserToken = async (req, res) => {
//   try {
//     const { refreshToken } = req.body;

//     // If they didn't send a refresh token, kick them out
//     if (!refreshToken) {
//       return res.status(401).json({ error: "No refresh token provided!" });
//     }

//     // Verify the refresh token using the REFRESH secret
//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

//     // THE DEEP CHECK: Does this user still exist in our MongoDB?
//     // (If you fired them and deleted them from the DB, this stops them instantly!)
//     const user = await User.findById(decoded.userId);
//     if (!user) {
//       return res.status(403).json({ error: "User no longer exists in the system!" });
//     }

//     // The user is safe! Forge a brand new 15-minute Access Token
//     const newAccessToken = jwt.sign(
//       { userId: user.user_id, email: user.email, role: user.role, isActive: user.isActive },
//       process.env.JWT_SECRET,
//       { expiresIn: '15m' }
//     );

//     // Give them the new wristband
//     res.json({ accessToken: newAccessToken });

//   } catch (error) {
//     // If the refresh token is fake or expired, kick them out
//     res.status(403).json({ error: "Invalid or expired refresh token. Please log in again." });
//   }
// };



// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// --- REGISTER LOGIC ---
export const registerUser = async (req, res) => {
  try {
    const { user_id, name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      user_id,
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(400).json({ error: "Email, user_id might already exist or something went wrong." });
  }
};

// --- LOGIN LOGIC ---
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "User account is inactive" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Access Token
    const accessToken = jwt.sign(
      {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30s" }
    );

    // Refresh Token
    const refreshToken = jwt.sign(
      { userId: user.user_id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful!",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// --- REFRESH TOKEN LOGIC ---
export const refreshUserToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided!" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Check by custom user_id, not MongoDB _id
    const user = await User.findOne({ user_id: decoded.userId });

    if (!user) {
      return res.status(403).json({ error: "User no longer exists in the system!" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "User account is inactive" });
    }

    const newAccessToken = jwt.sign(
      {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ error: "Invalid or expired refresh token. Please log in again." });
  }
};