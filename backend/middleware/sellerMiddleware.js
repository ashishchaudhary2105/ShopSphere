import jwt from "jsonwebtoken";

const sellerMiddleware = (req, res, next) => {
  try {
    const token = req.headers["authorization"];

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role != "seller") {
      return res
        .status(401)
        .json({
          error: "Access denied. on sellers are allowed in this route.",
        });
    }
    console.log("Decoded token:", decoded);

    
    req.id = decoded.id; 

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

export default sellerMiddleware;
