const express = require('express');
const { check } = require('express-validator');

const parkingController = require('../controllers/parkingController');
const auth = require('../middleware/auth');

const parkingRouter = express.Router();

parkingRouter.use(auth);

parkingRouter.get(
  '/:userId/current',
  [check('userId').isMongoId()],
  parkingController.getCurrentParkings
);

parkingRouter.get(
  '/:userId/all',
  [check('userId').isMongoId()],
  parkingController.getAllParkings
);

module.exports = parkingRouter;
