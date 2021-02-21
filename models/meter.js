const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const meterSchema = new Schema(
  {
    unitPrice: { type: Number, required: true},
    occupied: { type: Boolean, required: true, default: false },
    updated: { type: Date, default: Date.now },
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