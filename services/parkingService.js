require('dotenv').config();

const LOG = require('../utils/logger');

const Car = require('../models/car');
const Parking = require('../models/parking');
const Meter = require('../models/meter');

const { parkingConfirmationHook, paymentHook } = require('../webhook/webhook');

const getCurrentPreviousParkings = async (req, userId, getCurrent) => {
  let savedParkings;
  try {
    savedParkings = await Parking.find({
      userId: userId,
      isParked: getCurrent,
      isConfirmed: true,
    });
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
      message: 'Not found any current previous',
      code: 404,
    };
  }

  if (getCurrent) {
    return {
      success: true,
      currentParkings: savedParkings,
    };
  } else {
    return {
      success: true,
      previousParkings: savedParkings,
    };
  }
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

const createParking = async (
  req,
  licensePlate,
  meterId,
  unitPrice,
  isConfirmed
) => {
  let savedCar;
  try {
    savedCar = await Car.findOne({ licensePlate: licensePlate }).populate(
      'userId'
    );
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return {
      success: false,
      message: 'Find car failed',
      code: 500,
    };
  }

  //#region
  // DONE: what if sent the same create parking twice?
  // Need to check meterId, licensePlate, carId
  // Or... check in Meter.isOccupied?
  // if request.isOccupied == true && Meter.isOccupied == true
  // and request.licensePlate === Meter.licensePlate
  // then no need to create new parking!
  //#endregion

  const parking = new Parking({
    licensePlate: licensePlate,
    userId: savedCar ? savedCar.userId : undefined,
    carId: savedCar ? savedCar.id : undefined,
    meterId: meterId,
    unitPrice: unitPrice,
    isConfirmed: isConfirmed ? true : false,
    paymentId: savedCar ? savedCar.userId.paymentId : undefined,
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

  // alert admin if not confirmed within time minutes
  if (!newParking.isConfirmed) {
    setTimeout(
      async parkingId => {
        let savedParking;
        try {
          savedParking = await Parking.findById(parkingId);
        } catch (exception) {
          LOG.error(req._id, exception.message);
        }

        if (!savedParking.isConfirmed) {
          parkingConfirmationHook(savedParking);
        }
      },
      process.env.PARKINGCONFRIM_WAIT_MIN * 60 * 1000,
      newParking.id
    );
  }

  // alert admin if no payment method
  if (!newParking.paymentId) {
    setTimeout(
      async parkingId => {
        let savedParking;
        try {
          savedParking = await Parking.findById(parkingId);
        } catch (exception) {
          LOG.error(req._id, exception.message);
        }

        if (!savedParking.paymentId) {
          paymentHook(savedParking);
        }
      },
      process.env.PARKINGCONFRIM_WAIT_MIN * 60 * 1000,
      newParking.id
    );
  }

  return {
    success: true,
    parkingId: newParking.id,
    isUser: newParking.userId ? true : false,
  };
};

const leaveParking = async (req, parkingId, licensePlate) => {
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
      savedParking.unitPrice *
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
    cost: savedParking.cost,
  };
};

const confirmLicensePlate = async (req, parkingId, isNew, licensePlate) => {
  if (!isNew) {
    try {
      const newParking = await Parking.findByIdAndUpdate(
        parkingId,
        { isConfirmed: true },
        { new: true }
      );

      await Meter.findByIdAndUpdate(
        newParking.meterId,
        { isConfirmed: newParking.isConfirmed },
        { new: true }
      );

      return {
        success: true,
        parkingId: newParking.id,
      };
    } catch (exception) {
      LOG.error(req._id, exception.message);
      return {
        success: false,
        message: 'Update parking failed',
        code: 500,
      };
    }
  }

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

  let newParking;
  try {
    newParking = await Parking.findByIdAndUpdate(
      parkingId,
      {
        licensePlate: licensePlate,
        isConfirmed: true,
        userId: savedCar ? savedCar.userId : undefined,
        carId: savedCar ? savedCar.id : undefined,
      },
      { new: true }
    );

    await Meter.findByIdAndUpdate(
      newParking.meterId,
      { licensePlate: licensePlate },
      { new: true }
    );
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return {
      success: false,
      message: 'Update parking failed',
      code: 500,
    };
  }

  if (!newParking)
    return {
      success: false,
      message: 'Update parking unknown error',
      code: 500,
    };

  return {
    success: true,
    parkingId: newParking.id,
  };
};

const parkingAddPaymentId = async (req, parkingId, paymentId) => {
  let savedParking;
  try {
    savedParking = await Parking.findByIdAndUpdate(
      parkingId,
      { paymentId: paymentId },
      { new: true }
    );
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return {
      success: false,
      message: 'Update parking unknown error',
      code: 500,
    };
  }

  return {
    success: true,
    savedParking: savedParking,
  };
};

module.exports = {
  getCurrentPreviousParkings,
  getAllParkings,
  createParking,
  leaveParking,
  confirmLicensePlate,
  parkingAddPaymentId,
};
