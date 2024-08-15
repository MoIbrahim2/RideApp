import { Transform } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Acountries, getCountryCode } from 'utils/countries_cities';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEnum(Acountries)
  // @Transform(({ value }) => getCountryCode(value))
  country: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  @MinLength(4, { message: 'name should not be less than 6 characters' })
  name: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(20, {
    message: 'Password must be not more than 20 characters long ',
  })
  password: string;

  @IsNotEmpty()
  passwordConfirm: string;

  @IsNotEmpty()
  @IsPhoneNumber('EG')
  phone: string;

  @IsNotEmpty()
  @IsEnum(['male', 'female'], { message: 'Wrong gender input' })
  gender: string;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'Wrong date entered' })
  birthday: Date;
}
