const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define register and login routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Administrative User Management
router.get('/users', authController.listUsers);
router.put('/user/:userId', authController.updateUser);
router.delete('/user/:userId', authController.deleteUser);

module.exports = router;
