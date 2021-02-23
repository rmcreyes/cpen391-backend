require('dotenv').config();

const assert = require('assert');

const { validationResult } = require('express-validator');

const LOG = require('../utils/logger');

const HttpError = require('../utils/HttpError');
const Car = require('../models/car');
const User = require('../models/user');

const getCars = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const userId = req.params.userId;

  if (req.userData.userId === null || req.userData.userId !== userId)
    return next(new HttpError('Token missing or invalid', 401));

  let savedCars;
  try {
    savedCars = await Car.find({ userId: userId });

    if (!savedCars || savedCars.length === 0 || !Array.isArray(savedCars))
      return next(new HttpError('Not found', 404));
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return next(new HttpError('Failed getting cars', 500));
  }

  res.status(200).json({ cars: savedCars });
};

const getCar = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const userId = req.params.userId;
  const carId = req.params.carId;

  if (req.userData.userId === null || req.userData.userId !== userId || !carId)
    return next(new HttpError('Token missing or invalid', 401));

  let savedCar;
  try {
    savedCar = await Car.findById(carId);

    if (!savedCar) return next(new HttpError('Not found', 404));

    if (!savedCar.userId || savedCar.userId != userId) {
      LOG.error(req._id, 'Miss match userId and carId!');
      return next(new HttpError('Invalid user car', 500));
    }
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return next(new HttpError('Failed getting car', 500));
  }

  res.status(200).json(savedCar);
};

const postCar = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const body = req.body;
  const userId = req.params.userId;

  if (req.userData.userId === null || req.userData.userId !== userId)
    return next(new HttpError('Token missing or invalid', 401));

  if (Object.keys(body).length === 0 || !userId)
    return next(new HttpError('Missing parameters', 400));

  let { licensePlate } = body;
  if (!licensePlate) return next(new HttpError('Missing license plate', 400));

  try {
    const user = await User.findById(userId);

    const car = new Car({
      carName: body.carName || licensePlate.toUpperCase(),
      licensePlate: licensePlate.toUpperCase(),
      userId: userId,
    });

    const savedCar = await car.save();

    await user.cars.push(savedCar.id);
    await user.save();

    return res.status(201).json(savedCar);
  } catch (err) {
    if (
      err.message.includes(
        'Car validation failed: licensePlate: Error, expected `licensePlate` to be unique.'
      )
    ) {
      return next(new HttpError('Car already exist', 422));
    } else {
      LOG.error(req._id, err.message);
      return next(new HttpError('Failed post car', 500));
    }
  }
};

const deleteCar = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const userId = req.params.userId;
  const carId = req.params.carId;

  if (req.userData.userId === null || req.userData.userId !== userId || !carId)
    return next(new HttpError('Token missing or invalid', 401));

  try {
    const deletedCar = await Car.findOneAndDelete({
      _id: carId,
      userId: userId,
    });

    if (!deletedCar)
      return next(new HttpError('Not found or already deleted', 404));

    const user = await User.findById(userId);
    await user.cars.remove(carId);
    await user.save();
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return next(new HttpError('Failed deleting car', 500));
  }

  return res.status(200).json({ message: 'Deleted car' });
};

const putCar = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const userId = req.params.userId;
  const carId = req.params.carId;

  if (req.userData.userId === null || req.userData.userId !== userId || !carId)
    return next(new HttpError('Token missing or invalid', 401));

  const { carName } = req.body;
  if (!carName) return next(new HttpError('Missing parameter', 401));

  try {
    let savedCar = await Car.findOneAndUpdate(
      {
        _id: carId,
        userId: userId,
      },
      { carName: carName },
      { new: true }
    );

    assert(savedCar.carName === carName);
    assert(savedCar.userId.toString() === userId);
    assert(savedCar.id === carId);

    return res.status(200).json(savedCar);
  } catch (exception) {
    LOG.error(req._id, exception.message);
    if (exception.name === 'AssertionError')
      next(new HttpError('Error updating car', 500));

    next(new HttpError('Failed updating car', 500));
  }
};

module.exports = { getCars, getCar, postCar, deleteCar, putCar };
