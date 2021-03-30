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

paymentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject.password;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Payment', paymentSchema);
