require('dotenv').config();
const axios = require('axios').default;

const LOG = require('../utils/logger');

const {
  buildMeterStatusChangeMessage,
  buildParkingConfirmationMessage,
} = require('./messageBuilder');

const meterStatusChangeHook = async savedMeter => {
  const body = buildMeterStatusChangeMessage(savedMeter);

  sendHook(process.env.METERSTATUS_HOOK, body);
};

const parkingConfirmationHook = async savedParking => {
  const body = buildParkingConfirmationMessage(savedParking);

  sendHook(process.env.PARKINGCONFIRM_HOOK, body);
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
};
