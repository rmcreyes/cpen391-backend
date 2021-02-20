require('dotenv').config();

const { validationResult } = require('express-validator');

const LOG = require('../utils/logger');

const HttpError = require('../utils/HttpError');
const Car = require('../models/car');
const User = require('../models/user');

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

module.exports = { postCar };
