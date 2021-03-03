require('dotenv').config();

const { validationResult } = require('express-validator');

const LOG = require('../utils/logger');

const HttpError = require('../utils/HttpError');
const Meter = require('../models/meter');

const getAllMeterStatus = async (req, res, next) => {
  let savedMeters;
  try {
    savedMeters = await Meter.find();
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return next(new HttpError('Getting status failed', 500));
  }

  if (!savedMeters || !Array.isArray(savedMeters) || !savedMeters.length)
    return next(new HttpError('No meter found', 401));

  return res.status(200).json(savedMeters);
};

const addMeter = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const { unitPrice } = req.body;
  if (!unitPrice) return next(new HttpError('Invalid inputs', 422));

  const createdMeter = new Meter({
    unitPrice: unitPrice,
  });

  try {
    await createdMeter.save();
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return next(new HttpError('Adding meter failed', 500));
  }

  return res.status(201).json(createdMeter);
};

const getStatus = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const { meterId } = req.params;
  if (!meterId) return next(new HttpError('Invalid inputs', 422));

  let savedMeter;
  try {
    savedMeter = await Meter.findById(meterId);
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return next(new HttpError('Getting status failed', 500));
  }

  if (!savedMeter) return next(new HttpError('Invalid meter', 401));

  return res.status(200).json(savedMeter);
};

const updateStatus = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const { meterId } = req.params;
  const { isOccupied, licensePlate } = req.body;
  if (!meterId || !licensePlate)
    return next(new HttpError('Invalid inputs', 422));

  let updatedMeter;
  try {
    // call parking api to create parking object and save

    updatedMeter = await Meter.findByIdAndUpdate(
      meterId,
      { isOccupied: isOccupied },
      { new: true }
    );
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return next(new HttpError('Updating status failed', 500));
  }

  return res.status(200).json(updatedMeter);
};

module.exports = {
  getAllMeterStatus,
  addMeter,
  getStatus,
  updateStatus,
};
