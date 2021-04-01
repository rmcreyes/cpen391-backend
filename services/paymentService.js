require('dotenv').config();

const axios = require('axios').default;

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
    paymentId: newPayment.id,
  };
};

const authorizePayment = async (req, paymentId) => {
  let savedPayment;
  try {
    savedPayment = Payment.findById(paymentId);
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return {
      success: false,
      message: 'Find payment failed',
      code: 500,
    };
  }

  if (!savedPayment)
    return {
      success: false,
      message: 'Payment authorization failed',
      code: 401,
    };

  const body = {
    cardNum: savedPayment.cardNum,
    expDate: savedPayment.expDate,
    cvv: savedPayment.cvv,
  };

  const url = `${process.env.PAYMENT_AUTH_URL}?mocky-delay=${process.env.PAYMENT_AUTH_DELAY}ms`;

  let response;
  try {
    response = await axios.post(url, body);
  } catch (exception) {
    return {
      success: false,
      message: 'Payment authorization failed',
      code: 401,
    };
  }

  return response.data;
};

const updatePayment = async (req, paymentId, cardNum, expDate, cvv) => {
  let savedPayment;
  try {
    savedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      { cardNum: cardNum, expDate: expDate, cvv: cvv },
      { new: true }
    );
  } catch (exception) {
    LOG.error(req._id, exception.message);
    return {
      success: false,
      message: 'Find payment failed',
      code: 500,
    };
  }

  if (!savedPayment)
    return {
      success: false,
      message: 'Payment authorization failed',
      code: 401,
    };

  return { success: true, savedPayment };
};

module.exports = {
  createPayment,
  authorizePayment,
  updatePayment,
};
