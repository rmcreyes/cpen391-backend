const express = require('express');
const { check } = require('express-validator');

const carController = require('../controllers/carController');
const auth = require('../middleware/auth');

const carRouter = express.Router();

carRouter.use(auth);

carRouter.get('/:userId', carController.getCars);

carRouter.get('/:userId/:carId', carController.getCar);

carRouter.post(
  '/:userId',
  [check('licensePlate').isLength({ min: 6, max: 6 })],
  carController.postCar
);

module.exports = carRouter;
