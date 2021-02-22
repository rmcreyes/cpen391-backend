const express = require('express');
const { check } = require('express-validator');

const meterController = require('../controllers/meterController');
const auth = require('../middleware/auth');

const meterRouter = express.Router();

// meterRouter.use(auth);

meterRouter.post(
  '/addMeter',
  [check('unitPrice').isNumeric()],
  meterController.addMeter
);

meterRouter.get(
  '/:meterId',
  [check('meterId').isMongoId()],
  meterController.getStatus
);

meterRouter.put(
  '/:meterId',
  [check('meterId').isMongoId(), check('occupied').isBoolean()],
  meterController.updateStatus
);

module.exports = meterRouter;
