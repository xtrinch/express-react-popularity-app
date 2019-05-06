var express = require('express');
var router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET || 'some other secret as default';

router.post('/register', async (req, res) => {
    const errors = {};
    const user = User.findOne({username: req.body.username});

    // return if user was found in database
    if(user){
        errors.username = 'Username already exists.';
        return res.status(400).json(errors);
    }

    const newUser = new User({
        username: req.body.username,
        password: req.body.password
    });
    newUser.save();
    return res.status(200).json();
});

router.post('/login', async (req, res) => {
    const errors = {};
    const username = req.body.username
    const password = req.body.password;
    const user = await User.findOne({ username });

    // return if there was no user with this username found in the database
    if (!user) {
        errors.username = "No Account Found";
        return res.status(404).json(errors);
    }

    isMatch = await bcrypt.compare(password, user.password);

    // return 400 if password does not match
    if (!isMatch) {
        errors.password = "Password is incorrect";
        return res.status(400).json(errors);
    }

    const payload = {
        id: user._id,
        username: user.username
    };

    token = await jwt.sign(payload, secret, { expiresIn: 36000 });

    // return 500 if token is incorrect
    if (!token) {
        return res.status(500)
            .json({ error: "Error signing token",
                raw: err });
    }

    return res.json({
        success: true,
        token: `Bearer ${token}` });
});

module.exports = router;
