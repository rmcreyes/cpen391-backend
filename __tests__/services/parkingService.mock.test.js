const {
  createParking,
  leaveParking,
} = require('../../services/parkingService');

jest.mock('../../models/car');
const Car = require('../../models/car');

jest.mock('../../models/meter');
const Meter = require('../../models/meter');

jest.mock('../../models/parking');
const Parking = require('../../models/parking');

jest.mock('../../models/user');
const User = require('../../models/user');

describe('Parking service with database mocking', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('find car database failed', async () => {
    jest.spyOn(Car, 'findOne').mockImplementationOnce(() => {
      throw 'Error!!!';
    });

    const req = { id: 'ID' };
    const result = await createParking(req, 'LICENSE_PLATE', 'METER_ID', 12, true);
    expect(result).toBeTruthy();
    expect(!result.success).toBeTruthy();
    expect(result.message).toEqual('Find car failed');
    expect(result.code).toEqual(500);
  });
});
