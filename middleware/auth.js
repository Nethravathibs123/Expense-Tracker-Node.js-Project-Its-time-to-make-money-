
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = (req, res, next) => {
    try {
        const token = req.header('Authorization').split(' ')[1]; // Adjusts token format if 'Bearer token' format is used
        console.log(token);
        
        // Verify the token
        const decodedUser = jwt.verify(token, 'secretkey');
        console.log('userID>>>>>', decodedUser.userId);

        // Find the user by ID
        User.findByPk(decodedUser.userId)
            .then(user => {
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                req.user = user; // Attach user to the request object
                next();
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json({ success: false, message: 'Server error' });
            });
    } catch (err) {
        console.log(err);
        return res.status(401).json({ success: false, message: 'Unauthorized access' });
    }
};

module.exports = authenticate;
