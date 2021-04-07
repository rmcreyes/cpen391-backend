const express = require('express');
const { check } = require('express-validator');

const parkingController = require('../controllers/parkingController');
const auth = require('../middleware/auth');

const parkingRouter = express.Router();

parkingRouter.put(
  '/confirm/:parkingId',
  [
    check('parkingId').isMongoId(),
    check('isNew').isBoolean(),
    check('licensePlate').isLength({ min: 6, max: 8 }),
  ],
  parkingController.confirmParking
);

parkingRouter.use(auth);

parkingRouter.get(
  '/:userId/current',
  [check('userId').isMongoId()],
  parkingController.getCurrentParkings
);

parkingRouter.get(
  '/:userId/previous',
  [check('userId').isMongoId()],
  parkingController.getPreviousParkings
);

parkingRouter.get(
  '/:userId/all',
  [check('userId').isMongoId()],
  parkingController.getAllParkings
);

module.exports = parkingRouter;
