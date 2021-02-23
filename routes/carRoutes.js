const express = require('express');
const { check } = require('express-validator');

const carController = require('../controllers/carController');
const auth = require('../middleware/auth');

const carRouter = express.Router();

carRouter.use(auth);

carRouter.get('/:userId', [check('userId').isMongoId()], carController.getCars);

carRouter.get(
  '/:userId/:carId',
  [check('userId').isMongoId(), check('carId').isMongoId()],
  carController.getCar
);

carRouter.post(
  '/:userId',
  [check('licensePlate').isLength({ min: 6, max: 6 })],
  carController.postCar
);

carRouter.delete(
  '/:userId/:carId',
  [check('userId').isMongoId(), check('carId').isMongoId()],
  carController.deleteCar
);

carRouter.put(
  '/:userId/:carId',
  [
    check('carName').isString().notEmpty(),
    check('userId').isMongoId(),
    check('carId').isMongoId(),
  ],
  carController.putCar
);

module.exports = carRouter;
