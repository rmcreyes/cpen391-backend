require('dotenv').config();
const axios = require('axios').default;

const LOG = require('../utils/logger');

const buildMessage = savedMeter => {
  const meterId = {
    name: 'meterId',
    value: savedMeter.id,
  };
  const unitPrice = {
    name: 'unitPrice',
    value: savedMeter.unitPrice,
  };
  const isOccupied = {
    name: 'isOccupied',
    value: savedMeter.isOccupied,
    inline: true,
  };

  const licensePlate = {
    name: 'licensePlate',
    value: savedMeter.licensePlate ? savedMeter.licensePlate : 'None',
    inline: true,
  };
  const isConfirmed = {
    name: 'isConfirmed',
    value: savedMeter.isConfirmed ? savedMeter.isConfirmed : 'None',
    inline: true,
  };
  const parkingId = {
    name: 'parkingId',
    value: savedMeter.parkingId ? savedMeter.parkingId : 'None',
  };
  const cost = {
    name: 'cost',
    value: savedMeter.cost ? savedMeter.cost : 'None',
  };

  const author = {
    name: 'Meter Status Change ⌚',
  };
  const color = 15258703;
  const fields = [
    meterId,
    unitPrice,
    isOccupied,
    licensePlate,
    isConfirmed,
    parkingId,
    cost,
  ];
  const footer = {
    text: `updatedAt: ${savedMeter.updatedAt}`,
  };

  const avatar_url = process.env.AVATAR_URL;
  const embeds = [
    {
      author: author,
      color: color,
      fields: fields,
      footer: footer,
    },
  ];

  const body = { avatar_url, embeds };
  return body;
};

const sendHook = async savedMeter => {
  const body = buildMessage(savedMeter);

  try {
    await axios.post(process.env.WEBHOOK_URL, body);
  } catch (exception) {
    LOG.error('Discord webhook failed', exception);
  }

  return;
};

module.exports = {
  sendHook,
};
