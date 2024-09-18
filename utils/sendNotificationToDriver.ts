import { User } from 'src/entites/User';
import { getAddressFromCoordinates } from './getLocation';
import { NearbyDriver } from 'src/DTOs/nearbyDriver';
import { Repository } from 'typeorm';
import { Notification } from 'src/entites/Notification';
import { formatDate } from 'utils/dateUtils';
import { sendMessage } from './firebaseConfig';
export const sendNotficationToAllNearestDrivers = async (
  user: User,
  pickupLat: number,
  pickupLong: number,
  expectedPrice: number,
  nearestDrivers: NearbyDriver[],
  Notification: Repository<Notification>,
  rideRequestId: string,
  pickupDate?: Date,
) => {
  const address = await getAddressFromCoordinates(pickupLat, pickupLong);
  const minAllowedPrice = (expectedPrice * 0.65).toFixed(2);
  const maxAllowedPrice = (expectedPrice * 1.35).toFixed(2);

  let scheduleMessage = '';
  pickupDate = new Date(pickupDate);
  if (pickupDate)
    scheduleMessage = `This ride request is scheduled to ${formatDate(pickupDate)} `;

  nearestDrivers.forEach(async (nearestDriver) => {
    const driverNotification = Notification.create({
      driver: { id: nearestDriver.driverId },
      message: `New ride request`,
      data: {
        from: user.name,
        address,
        distance: nearestDriver.distance,
        rideRequestId,
        expectedPrice,
        priceMessage: `notice your maximum price offer will be ${maxAllowedPrice}, and the minimum one is ${minAllowedPrice}`,
        scheduleMessage,
      },
    });
    await sendMessage(nearestDriver.driverNotificationToken, {
      title: `New ride request `,
      body: `request ride from ${user.name}`,
      data: {
        address,
        distance: nearestDriver.distance.toString(),
        rideRequestId,
        expectedPrice: expectedPrice.toString(),
        priceMessage: `notice your maximum price offer will be ${maxAllowedPrice}, and the minimum one is ${minAllowedPrice}`,
      },
    });
    await Notification.save(driverNotification);
  });
};
