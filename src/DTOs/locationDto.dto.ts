import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class LocationDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  destinationLat: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  destinationLong: number;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  pickupLat: number;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  pickupLong: number;
}
