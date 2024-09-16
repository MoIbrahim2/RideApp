import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class RideListenerService {
  @OnEvent('rideAccepted')
  handelRideAcceptedEvent() {}
}
