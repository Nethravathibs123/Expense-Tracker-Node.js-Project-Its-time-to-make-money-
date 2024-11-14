const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Use environment variables securely
const JWT_SECRET = process.env.JWT_SECRET;

// Function to generate JWT access token
function generateAccessToken(id, name) {
    return jwt.sign(
        { userId: id, name: name },
        JWT_SECRET  // Use the secret from environment variables
    );
}

// Signup controller
exports.postAddUsers = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists.' });
        }

        // Hash the password and create the user
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, email, password: hashedPassword });

        return res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Login controller
exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ where: { email } });
        
        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify the password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Generate a token with the user's ID and name (or username)
        const token = generateAccessToken(user.id, user.username);

        return res.status(200).json({ message: 'Login successful', token: token });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
