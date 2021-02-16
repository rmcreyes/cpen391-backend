const express = require('express');
const { check } = require('express-validator');

const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const userRouter = express.Router();

userRouter.post(
  '/signup',
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').not().isEmpty(),
  ],
  userController.signup
);

userRouter.post('/login', userController.login);

userRouter.use(auth);

userRouter.get('/me', userController.getUserProfile);

userRouter.put(
  '/me',
  [
    check('name').notEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('city').notEmpty(),
  ],
  userController.updateUserProfile
);

module.exports = userRouter;
