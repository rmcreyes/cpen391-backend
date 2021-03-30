const express = require('express');
const { check } = require('express-validator');

const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

const paymentRouter = express.Router();

paymentRouter.post(
  '/guest/:parkingId',
  [
    check('parkingId').isMongoId(),
    check('cardNum').isNumeric(),
    check('expDate').isNumeric(),
    check('cvv').isNumeric(),
  ],
  paymentController.addGuestPayment
);

paymentRouter.use(auth);

paymentRouter.post(
  '/user/:userId',
  [
    check('userId').isMongoId(),
    check('cardNum').isNumeric(),
    check('expDate').isNumeric(),
    check('cvv').isNumeric(),
  ],
  paymentController.addUserPayment
);

module.exports = paymentRouter;
