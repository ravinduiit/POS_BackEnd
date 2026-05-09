// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  // 1. The Bouncer asks for the wristband (Token) from the request headers
  const authHeader = req.header('Authorization');

  // 2. If there is no token at all, kick them out immediately
  if (!authHeader) {
    return res.status(401).json({ error: "Access Denied! No VIP wristband found." });
  }

  try {
    // Tokens usually come in the format: "Bearer eyJhbGciOi..." 
    // We need to cut off the word "Bearer " to just get the token string
    const token = authHeader.split(" ")[1];

    // 3. The Bouncer checks the secret signature and expiration date
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Success! We attach the decoded payload (userId, email) to the request
    // so the next room can know exactly who just walked in.
    req.user = verified;

    // 5. Open the door and let them through to the actual route!
    next(); 
  } catch (error) {
    // If the token is fake, altered, or expired, it throws an error and kicks them out
    res.status(403).json({ error: "Invalid or expired wristband!" });
  }
};

export default verifyToken; 