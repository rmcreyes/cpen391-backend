const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const parkingSchema = new Schema(
  {
    licensePlate: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
    },
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      default: undefined,
    },
    meterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meter',
      required: true,
    },
    startTime: { type: Date, default: Date.now },
    isConfirmed: { type: Boolean, default: false, required: true },
    endTime: { type: Date },
    isParked: { type: Boolean, default: true },
    unitPrice: { type: Number, required: true },
    cost: { type: Number },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      require: true,
      default: undefined
    },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

parkingSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.createdAt;
    delete returnedObject.updatedAt;
    delete returnedObject.isConfirmed;
  },
});

module.exports = mongoose.model('Parking', parkingSchema);
