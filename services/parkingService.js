require('dotenv').config();
const LOG = require('../utils/logger');
const Meter = require('../models/meter');
const Car = require('../models/car');
const User = require('../models/user');
const Parking = require('../models/parking');

const createParking = async (licensePlate, userId, carId, meterId) => {
  let savedParking;
  try {
    const parking = new Parking({
      licensePlate: licensePlate,
      userId: userId,
      carId: carId,
      meterId: meterId,
    });

    savedParking = await parking.save();
  } catch (exception) {
    return {
      success: false
    };
  }

  return {
    success: true,
    parkingId: savedParking.id
  };
}

module.exports = {
  createParking
};