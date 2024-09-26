import { Processor, WorkerHost } from '@nestjs/bullmq';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { Voucher } from 'src/entites/Vouchers';
import { VoucherService } from 'src/voucher/service/voucher/voucher.service';
import { Refactoring } from 'utils/Refactoring';
import { RidesService } from '../services/rides/rides.service';
import { NotificationService } from 'src/notification/services/notification/notification.service';
import { Ride } from 'src/entites/Ride';
import { User } from 'src/entites/User';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/entites/Notification';
@Processor('schedule-trip')
export class TripSchedulerProcessor extends WorkerHost {
  constructor(
    @Inject(VoucherService) private readonly voucherService: VoucherService,
    @Inject(Refactoring) private readonly Refactoring: Refactoring,
    @Inject(RidesService) private readonly rideService: RidesService,
    @Inject(NotificationService)
    private readonly notificationService: NotificationService,
    @InjectRepository(Ride) private readonly Ride: Repository<Ride>,
    @InjectRepository(User) private readonly User: Repository<User>,
    @InjectRepository(Notification)
    private readonly Notification: Repository<Notification>,
  ) {
    super();
  }
  async process(job: Job, token?: string): Promise<any> {
    let {
      tripId,
      pickupDate,
      pickupLat,
      pickupLong,
      user,
      drivers,
      searchZone,
      destinationLat,
      destinationLong,
      discountVoucher,
      paymentMethod,
      admin,
    } = job.data;
    if (!pickupLat || !pickupLong) {
      pickupLat = user.latitude;
      pickupLong = user.longitude;
    }

    const nearbyDrivers = this.Refactoring.searchingForNearbyDrivers(
      drivers,
      pickupLat,
      pickupLong,
      searchZone,
    );

    const price = await this.Refactoring.calcEstimatedPrice(
      pickupLat,
      pickupLong,
      destinationLat,
      destinationLong,
    );

    if (!nearbyDrivers)
      throw new HttpException(
        'There is no captains available around you right now please try again later',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    let voucher: Voucher = null;
    if (discountVoucher) {
      voucher = await this.voucherService.validateVoucher(discountVoucher);
    }

    const ride = await this.Ride.save(
      this.Ride.create({
        discountVoucher: voucher,
        scheduledTo: pickupDate,
        paymentMethod: paymentMethod,
        expectedPrice: price,
        user: { id: user.id },
        to: { destinationLat, destinationLong },
        from: {
          destinationLat: pickupLat,
          destinationLong: pickupLong,
        },
        nearbyDrivers,
      }),
    );
    this.notificationService.sendNotficationToAllNearestDrivers(
      destinationLat,
      destinationLong,
      user,
      pickupLat,
      pickupLong,
      price,
      nearbyDrivers,
      this.Notification,
      ride.id,
      pickupDate,
      admin,
    );
  }
}
