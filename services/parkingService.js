require('dotenv').config();

const LOG = require('../utils/logger');

const Car = require('../models/car');
const Parking = require('../models/parking');

const getCurrentParkings = async (req, userId) => {
  let savedParkings;
  try {
    savedParkings = await Parking.find({ userId: userId, isParked: true });
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return {
      success: false,
      message: 'Finding parking failed',
      code: 500,
    };
  }

  if (
    !savedParkings ||
    savedParkings.length === 0 ||
    !Array.isArray(savedParkings)
  ) {
    return {
      success: false,
      message: 'Not found currently parked',
      code: 404,
    };
  }

  return {
    success: true,
    currentParkings: savedParkings,
  };
};

const getAllParkings = async (req, userId) => {
  let savedParkings;
  try {
    savedParkings = await Parking.find({ userId: userId });
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return {
      success: false,
      message: 'Finding parking failed',
      code: 500,
    };
  }

  if (
    !savedParkings ||
    savedParkings.length === 0 ||
    !Array.isArray(savedParkings)
  ) {
    return {
      success: false,
      message: 'Not found any parked',
      code: 404,
    };
  }

  return {
    success: true,
    allParkings: savedParkings,
  };
};

const createParking = async (req, licensePlate, meterId) => {
  let savedCar;
  try {
    savedCar = await Car.findOne({ licensePlate: licensePlate });
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return {
      success: false,
      message: 'Find car failed',
      code: 500,
    };
  }

  // DONE: what if sent the same create parking twice?
  // Need to check meterId, licensePlate, carId
  // Or... check in Meter.isOccupied?
  // if request.isOccupied == true && Meter.isOccupied == true
  // and request.licensePlate === Meter.licensePlate
  // then no need to create new parking!

  const parking = new Parking({
    licensePlate: licensePlate,
    userId: savedCar ? savedCar.userId : undefined,
    carId: savedCar ? savedCar.id : undefined,
    meterId: meterId,
  });

  let newParking;
  try {
    newParking = await parking.save();
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return {
      success: false,
      message: 'Adding parking failed',
      code: 500,
    };
  }

  return {
    success: true,
    parkingId: newParking.id,
  };
};

const leaveParking = async (req, parkingId, licensePlate, unitPrice) => {
  let savedParking;
  try {
    savedParking = await Parking.findById(parkingId);
    if (!savedParking) {
      return {
        success: false,
        message: 'Not found parking',
        code: 404,
      };
    }

    if (savedParking.licensePlate !== licensePlate) {
      return {
        success: false,
        message: 'Parking license plate not matched',
        code: 404,
      };
    }

    savedParking.isParked = false;
    savedParking.endTime = Date.now();
    savedParking.cost =
      unitPrice *
      Math.ceil(
        (savedParking.endTime - savedParking.startTime) / (1000 * 3600)
      );

    await savedParking.save();
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return {
      success: false,
      message: 'Find parking failed',
      code: 500,
    };
  }

  return {
    success: true,
  };
};

module.exports = {
  getCurrentParkings,
  getAllParkings,
  createParking,
  leaveParking,
};
