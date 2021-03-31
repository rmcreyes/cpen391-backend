const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    cardNum: { type: Number, required: true },
    expDate: { type: Number, require: true },
    cvv: { type: Number, required: true },
  },
  { versionKey: false }
);

paymentSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Payment', paymentSchema);
