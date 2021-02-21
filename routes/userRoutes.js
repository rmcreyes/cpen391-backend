const express = require('express');
const { check } = require('express-validator');

const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const userRouter = express.Router();

userRouter.post(
  '/signup',
  [
    check('firstName').isString().notEmpty(),
    check('lastName').isString().notEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isString().notEmpty(),
  ],
  userController.signup
);

userRouter.post('/login', userController.login);

userRouter.use(auth);

userRouter.get('/me', userController.getUserProfile);

userRouter.put(
  '/me',
  [
    check('firstName').isString().notEmpty(),
    check('lastName').isString().notEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isString().notEmpty(),
    check('licensePlate').isLength({ min: 6, max: 6 }),
  ],
  userController.updateUserProfile
);

module.exports = userRouter;
