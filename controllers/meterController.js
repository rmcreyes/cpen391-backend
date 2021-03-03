require('dotenv').config();

const { validationResult } = require('express-validator');

const LOG = require('../utils/logger');

const HttpError = require('../utils/HttpError');

const Meter = require('../models/meter');
const Car = require('../models/car');
const User = require('../models/user');

const ParkingService = require('../services/parkingService');

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

  if (!savedMeter) return next(new HttpError('Meter not found', 401));

  return res.status(200).json(savedMeter);
};

const updateStatus = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const { meterId } = req.params;
  const { isOccupied, licensePlate } = req.body;
  if (!meterId || !licensePlate)
    return next(new HttpError('Invalid inputs', 422));

  let savedMeter;
  try {
    savedMeter = await Meter.findById(meterId);
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return next(new HttpError('Getting meter failed', 500));
  }
  if (!savedMeter) return next(new HttpError('Meter not found', 401));

  // TODO: call parking api to create parking object and save

  // if isOccupied == true && some license plate (new car parked)
  //    then
  //        have -- meterId, licenseplate
  //        licenseplate -> find Car
  //        if Car exist (using app) -> carId and userId -> save
  //        else (using tablet) -> save

  // if isOccupied == false && some license plate (parked car leaving)
  //    then
  //    if this license plate is the same one in DB
  //        have parkingId -> find parking object -> fill in endTime && cost && paid
  //    else this license plate is different
  //        not possible, since parked car MUST leave before another car can be parked

  if (isOccupied) {
    const result = await ParkingService.createParking(
      req,
      licensePlate,
      meterId
    );

    if (!result.success) return next(new HttpError(result.message, result.code));

    savedMeter.licensePlate = licensePlate;
    savedMeter.parkingId = result.parkingId;
  } else {
    if (savedMeter.licensePlate !== licensePlate)
      return next(new HttpError('Error: existing parked car', 409));

    const result = await ParkingService.leaveParking(
      req,
      savedMeter.parkingId,
      savedMeter.licensePlate,
      savedMeter.unitPrice
    );
    if (!result.success) return next(new HttpError(result.message, result.code));

    savedMeter.licensePlate = undefined;
    savedMeter.parkingId = undefined;
  }

  try {
    savedMeter.isOccupied = isOccupied;
    await savedMeter.save();
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return next(new HttpError('Updating meter failed', 500));
  }

  return res.status(200).json(savedMeter);
};

module.exports = {
  addMeter,
  getStatus,
  updateStatus,
};
