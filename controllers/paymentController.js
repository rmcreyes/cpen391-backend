require('dotenv').config();
const { validationResult } = require('express-validator');

const LOG = require('../utils/logger');
const HttpError = require('../utils/HttpError');

const PaymentSerive = require('../services/paymentService');
const ParkingService = require('../services/parkingService');

/**
 * Sent by meter tablet
 * Called when guest enters payment on tablet
 */
const addGuestPayment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const { parkingId } = req.params;
  const { cardNum, expDate, cvv } = req.body;
  if (!parkingId || !cardNum || !expDate || !cvv)
    return next(new HttpError('Invalid inputs', 422));

  let result = await PaymentSerive.createPayment(
    req,
    false,
    undefined,
    cardNum,
    expDate,
    cvv
  );
  if (!result.success) return next(new HttpError(result.message, result.code));

  result = await ParkingService.parkingAddPaymentId(
    req,
    parkingId,
    result.paymentId
  );
  if (!result.success) return next(new HttpError(result.message, result.code));

  return res.status(201).json(true);
};

/**
 * Sent by user app
 * Called when user enters payment on app
 */
const addUserPayment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const { userId } = req.params;
  const { cardNum, expDate, cvv } = req.body;
  if (!userId || !cardNum || !expDate || !cvv)
    return next(new HttpError('Invalid inputs', 422));

  if (req.userData.userId === null || req.userData.userId !== userId)
    return next(new HttpError('Token missing or invalid', 401));

  let result = await PaymentSerive.createPayment(
    req,
    true,
    userId,
    cardNum,
    expDate,
    cvv
  );
  if (!result.success) return next(new HttpError(result.message, result.code));

  return res.status(201).json(true);
};

module.exports = {
  addGuestPayment,
  addUserPayment,
};
