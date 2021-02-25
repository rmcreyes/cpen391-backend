const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const parkingSchema = new Schema(
  {
    licensePlate: { type: String, required: true, unique: true },
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
      unique: true,
    },
    meterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meter',
      required: true,
      unique: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    isParked: { type: Boolean, required: true },
    cost: { type: Number },
    paid: { type: Boolean },
  },
  { versionKey: false }
);

parkingSchema.plugin(uniqueValidator);

parkingSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Parking', parkingSchema);
