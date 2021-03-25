const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const meterSchema = new Schema(
  {
    unitPrice: { type: Number, required: true },
    isOccupied: { type: Boolean, required: true, default: false },
    licensePlate: { type: String },
    isConfirmed: { type: Boolean, default: false },
    parkingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parking',
      default: undefined,
    },
    cost: { type: Number },
  },
  { timestamps: true, versionKey: false }
);

meterSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.parkingId = returnedObject.parkingId
      ? returnedObject.parkingId.toString()
      : undefined;
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.createdAt;
    delete returnedObject.updatedAt;

    if (!returnedObject.cost) delete returnedObject.cost;
    if (!returnedObject.licensePlate) delete returnedObject.licensePlate;
  },
});

module.exports = mongoose.model('Meter', meterSchema);
