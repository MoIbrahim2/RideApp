import { IsDate, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { LocationDto } from './locationDto.dto';
import { Transform } from 'class-transformer';

export class RequestRideDto extends LocationDto {
  @IsNotEmpty()
  @IsEnum(['small', 'medium', 'family'])
  sizeOfTheCar: string;

  @IsNotEmpty()
  @IsEnum(['wallet', 'cash'])
  paymentMethod: string;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  pickupDate: Date;
}
