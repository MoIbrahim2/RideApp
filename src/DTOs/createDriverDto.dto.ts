import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  Length,
  MaxLength,
  min,
  MinLength,
} from 'class-validator';
import { CreateUserDto } from './createUserDto.dto';
import { Acountries, getCountryCode } from 'utils/countries_cities';
import { Transform } from 'class-transformer';

export class CreateDriverDTO extends CreateUserDto {
  @IsNotEmpty()
  carEdition: string;
  @IsNotEmpty()
  carBrand: string;
  @IsNotEmpty()
  carNumbers: string;
  @IsNotEmpty()
  carLetters: string;
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  manufacturingYear: number;
  @IsNotEmpty()
  @Length(17, 17, { message: 'number vehicle id should be exactly 17 ' })
  numberVehicleId: string;
  // @IsNotEmpty()
  // carPhotos: string[];
  @IsNotEmpty()
  @Length(14, 14, { message: 'personal Id must be exactly 14' })
  personalIdNumber: string;
}
