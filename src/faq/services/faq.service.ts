import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createFaqDto } from 'src/DTOs/createFaqDto.dto';
import { FAQ } from 'src/entites/FAQ';
import { Repository } from 'typeorm';

@Injectable()
export class FaqService {
  constructor(@InjectRepository(FAQ) private FAQ: Repository<FAQ>) {}

  async findAll() {
    const faqs = await this.FAQ.find();
    return {
      status: 'sucess',
      data: faqs,
    };
  }

  async createQuestion(faq: createFaqDto) {
    const newFaq = await this.FAQ.save(this.FAQ.create(faq));
    return {
      status: 'success',
      message: 'The FAQ created Successfully',
      data: newFaq,
    };
  }
}
