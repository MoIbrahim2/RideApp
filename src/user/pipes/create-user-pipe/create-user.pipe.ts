import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class CreateUserPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.password !== value.passwordConfirm)
      throw new HttpException(
        "The password and password confirm don't match",
        HttpStatus.BAD_REQUEST,
      );
    delete value.passwordConfirm;
    return { ...value };
  }
}
