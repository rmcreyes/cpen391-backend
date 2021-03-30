require('dotenv').config();
const axios = require('axios').default;

const LOG = require('../utils/logger');

const {
  buildMeterStatusChangeMessage,
  buildParkingMessage,
} = require('./messageBuilder');

const meterStatusChangeHook = async savedMeter => {
  const body = buildMeterStatusChangeMessage(savedMeter);

  sendHook(process.env.METERSTATUS_HOOK, body);
};

const parkingConfirmationHook = async savedParking => {
  const body = buildParkingMessage(savedParking, true);

  sendHook(process.env.PARKINGCONFIRM_HOOK, body);
};

const paymentHook = async savedParking => {
  const body = buildParkingMessage(savedParking, false);

  sendHook(process.env.PAYMENT_HOOK, body);
};

const sendHook = async (url, body) => {
  if (process.env.NODE_ENV !== 'test') {
    try {
      await axios.post(url, body);
    } catch (exception) {
      LOG.error('Discord webhook failed', exception);
    }
  }

  return;
};

module.exports = {
  meterStatusChangeHook,
  parkingConfirmationHook,
  paymentHook,
};
