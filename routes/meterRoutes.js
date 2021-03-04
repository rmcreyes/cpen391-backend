const express = require('express');
const { check } = require('express-validator');

const meterController = require('../controllers/meterController');

const meterRouter = express.Router();

// meterRouter.use(auth);

meterRouter.post(
  '/addMeter',
  [check('unitPrice').isNumeric().notEmpty()],
  meterController.addMeter
);

meterRouter.get(
  '/:meterId',
  [check('meterId').isMongoId().notEmpty()],
  meterController.getMeter
);

meterRouter.put(
  '/:meterId',
  [
    check('meterId').isMongoId().notEmpty(),
    check('isOccupied').isBoolean().notEmpty(),
    check('licensePlate').isLength({ min: 6, max: 6 })
  ],
  meterController.updateStatus
);

module.exports = meterRouter;
