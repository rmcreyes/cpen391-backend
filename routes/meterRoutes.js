const express = require('express');
const { check } = require('express-validator');

const meterController = require('../controllers/meterController');
const auth = require('../middleware/auth');

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
  meterController.getStatus
);

meterRouter.put(
  '/:meterId',
  [
    check('meterId').isMongoId().notEmpty(),
    check('occupied').isBoolean().notEmpty(),
  ],
  meterController.updateStatus
);

module.exports = meterRouter;