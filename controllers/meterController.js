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

  let savedParking;
  if (isOccupied) {
    let savedCar;
    try {
      savedCar = await Car.findOne({ licensePlate: licensePlate });
    } catch (exception) {
      LOG.error(req._id, exception.message);
      return next(new HttpError('Find car failed', 500));
    }

    savedParking = await ParkingService.createParking(
      licensePlate,
      savedCar.userId ? savedCar.userId : undefined,
      savedCar.id ? savedCar.userId : undefined,
      meterId
    );

    if (!savedParking.success)
      return next(new HttpError('Adding parking failed', 500));
  } else {
  }

  let updatedMeter;
  try {
    updatedMeter = await Meter.findByIdAndUpdate(
      meterId,
      {
        isOccupied: isOccupied,
        licensePlate: licensePlate,
        parkingId: savedParking.parkingId,
      },
      { new: true }
    );
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return next(new HttpError('Updating status failed', 500));
  }

  return res.status(200).json(updatedMeter);
};

module.exports = {
  addMeter,
  getStatus,
  updateStatus,
};
