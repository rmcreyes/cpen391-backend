require('dotenv').config();

const { validationResult } = require('express-validator');

const LOG = require('../utils/logger');

const HttpError = require('../utils/HttpError');

const ParkingService = require('../services/parkingService');

const getCurrentParkings = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const userId = req.params.userId;
  if (req.userData.userId === null || req.userData.userId !== userId)
    return next(new HttpError('Token missing or invalid', 401));

  const result = await ParkingService.getCurrentPreviousParkings(req, userId, true);
  if (!result.success) return next(new HttpError(result.message, result.code));

  delete result.success;

  return res.status(200).json(result);
};

const getPreviousParkings = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const userId = req.params.userId;
  if (req.userData.userId === null || req.userData.userId !== userId)
    return next(new HttpError('Token missing or invalid', 401));

  const result = await ParkingService.getCurrentPreviousParkings(req, userId, false);
  if (!result.success) return next(new HttpError(result.message, result.code));

  delete result.success;

  return res.status(200).json(result);
};

const getAllParkings = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const userId = req.params.userId;
  if (req.userData.userId === null || req.userData.userId !== userId)
    return next(new HttpError('Token missing or invalid', 401));

  const result = await ParkingService.getAllParkings(req, userId);
  if (!result.success) return next(new HttpError(result.message, result.code));

  delete result.success;

  return res.status(200).json(result);
};

module.exports = {
  getCurrentParkings,
  getPreviousParkings,
  getAllParkings
};
