const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(403).json({ msg: "No token provided" });
    }

    try {
        const key = process.env.JWT_SECRET; // Use the JWT_SECRET from environment variables
        const decoded = jwt.verify(token, key);  // Decodes and verifies the token

        // Ensure that the token contains a valid userId
        if (!decoded || !decoded.userId) {
            return res.status(400).json({ msg: "Invalid token payload" });
        }

        // Find the user by ID and attach to the request object
        User.findByPk(decoded.userId)
            .then(user => {
                if (!user) {
                    return res.status(404).json({ msg: 'User not found' });
                }
                req.user = user;  // Attach user to request
                next();  // Continue to the next middleware or route
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ msg: 'Failed to authenticate token' });
            });
    } catch (err) {
        console.error(err);
        return res.status(401).json({ msg: 'Unauthorized access, invalid or expired token' });
    }
};

module.exports = authenticate;
