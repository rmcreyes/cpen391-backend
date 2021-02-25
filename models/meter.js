const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const meterSchema = new Schema(
  {
    unitPrice: { type: Number, required: true },
    isOccupied: { type: Boolean, required: true, default: false },
    updated: { type: Date, default: Date.now },
    licensePlate: { type: String },
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parking',
    },
  },
  { versionKey: false }
);

meterSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Meter', meterSchema);
