// routes/authRoutes.js
import express from "express";
const router = express.Router();
import {
  registerUser,
  loginUser,
  refreshUserToken,
} from "../controllers/authController.js";

// Bring in our Bouncer!
import verifyToken from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

// When a user goes to /register, run the registerUser brain
router.post('/register', registerUser);

// When a user goes to /login, run the loginUser brain
router.post('/login', loginUser);

// NEW: The Refresh Route (Notice it does NOT use the Bouncer middleware, 
// because their Access Token is dead! The controller handles the checking.)
router.post('/refresh', refreshUserToken);


// OUR NEW PROTECTED ROUTE
router.get('/profile', verifyToken, authorizeRoles("Admin"), (req, res) => {
  // Because the Bouncer attached the user data to req.user, we can use it here!
  res.json({
    message: "Welcome to the VIP Lounge!",
    secretData: "Here is your highly classified information.",
    user: req.user // This will show the userId and email from the token payload!
  });
});

export default router;