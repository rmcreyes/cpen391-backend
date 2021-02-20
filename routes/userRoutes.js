const express = require('express');
const { check } = require('express-validator');

const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const userRouter = express.Router();

userRouter.post(
  '/signup',
  [
    check('firstName').not().isEmpty(),
    check('lastName').not().isEmpty(),
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
    check('firstName').not().isEmpty(),
    check('lastName').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').not().isEmpty(),
    check('licensePlate').isLength({ min: 6, max: 6 }),
  ],
  userController.updateUserProfile
);

module.exports = userRouter;
