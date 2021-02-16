require('dotenv').config();

const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const LOG = require('../utils/logger');

const HttpError = require('../utils/HttpError');
const User = require('../models/user');

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const { firstName, lastName, email, password, licensePlate} = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT));
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(new HttpError('Could not create user', 500));
  }

  const createdUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    licensePlate
  });

  try {
    await createdUser.save();
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(new HttpError('User exists already, please login', 422));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRE_TIME }
    );
  } catch {
    return next(new HttpError('Signing Up failed, please try again', 500));
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new HttpError('Invalid credentials, could not login', 401));

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(new HttpError('Login failed, please try again later', 500));
  }

  if (!existingUser) return next(new HttpError('Invalid credentials', 401));

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(new HttpError('Could not login, invalid credentials', 500));
  }

  if (!isValidPassword) return next(new HttpError('Invalid credentials', 401));

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRE_TIME }
    );
  } catch {
    return next(new HttpError('Login failed, please try again', 500));
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token,
  });
};

const getUserProfile = async (req, res, next) => {
  const { userId } = req.userData;

  let user;
  try {
    user = await User.findById(userId, '-password');
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(new HttpError('Failed to get profile', 500));
  }

  res.status(200).json(user);
};

const updateUserProfile = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const { userId } = req.userData;
  const { firstName, lastName, email, licensePlate } = req.body;

  let updatedUser;
  try {
    updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { firstName, lastName, email, licensePlate },
      { new: true }
    );
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(new HttpError('Email has already been registered', 422));
  }

  res.status(200).json({ message: 'Update profile successfully', updatedUser });
};

module.exports = {
  signup,
  login,
  getUserProfile,
  updateUserProfile,
};
