const buildMeterStatusChangeMessage = savedMeter => {
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
  const color = savedMeter.isOccupied ? 320671 : 16766254; // arriving : leaving
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

  const embeds = [
    {
      author: author,
      color: color,
      fields: fields,
      footer: footer,
    },
  ];

  const body = { embeds };
  return body;
};

const buildParkingConfirmationMessage = savedParking => {
  const meterId = {
    name: 'meterId',
    value: savedParking.meterId,
    inline: true,
  };

  const parkingId = {
    name: 'parkingId',
    value: savedParking.id,
    inline: true,
  };

  const licensePlate = {
    name: 'licensePlate',
    value: savedParking.licensePlate,
  };

  const startTime = {
    name: 'startTime',
    value: savedParking.startTime,
  };

  const author = {
    name: 'Parking Not Confirmed ❌',
  };
  const color = 16711680; // red
  const fields = [meterId, parkingId, licensePlate, startTime];
  const footer = {
    text: `updatedAt: ${savedParking.updatedAt}`,
  };

  const embeds = [
    {
      author: author,
      color: color,
      fields: fields,
      footer: footer,
    },
  ];

  const body = { embeds };
  return body;
};

module.exports = {
  buildMeterStatusChangeMessage,
  buildParkingConfirmationMessage,
};
