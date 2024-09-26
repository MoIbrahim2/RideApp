import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ConfirmationTripDto {
  @IsNotEmpty()
  @IsBoolean()
  accept: boolean;

  @IsNotEmpty()
  @IsString()
  driverId: string;
}
