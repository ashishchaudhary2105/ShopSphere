import jwt from "jsonwebtoken";

const userMiddleware = (req, res, next) => {
  try {
    const token = req.headers["authorization"];

    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Make sure this matches your JWT payload structure
    req.id = decoded.id ; // Changed to userId to match your controller

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

// Use named export instead of default export
export default userMiddleware ;