require('dotenv').config();

const LOG = require('../utils/logger');

const Car = require('../models/car');
const Parking = require('../models/parking');
const Meter = require('../models/meter');
const Payment = require('../models/payment');
const User = require('../models/user');

const createPayment = async (req, isUser, userId, cardNum, expDate, cvv) => {
  const payment = new Payment({
    cardNum: cardNum,
    expDate: expDate,
    cvv: cvv,
  });

  let newPayment;
  try {
    newPayment = await payment.save();
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return {
      success: false,
      message: 'Adding payment failed',
      code: 500,
    };
  }

  if (isUser && userId) {
    try {
      await User.findByIdAndUpdate(
        userId,
        { paymentId: newPayment.id },
        { new: true }
      );
    } catch (exception) {
      LOG.error(req._id, exception.message);
      return {
        success: false,
        message: 'Edit user payment failed',
        code: 500,
      };
    }
  }

  return {
    success: true,
    paymentId: newPayment.id
  }
};


module.exports = {
  createPayment
}