import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FaqService } from '../services/faq.service';
import { createFaqDto } from 'src/DTOs/createFaqDto.dto';

@UsePipes(ValidationPipe)
@Controller('faq')
export class FaqController {
  constructor(private faqService: FaqService) {}

  @Get('getAllFaqs')
  async getAllServcices() {
    const faqs = await this.faqService.findAll();
    return faqs;
  }

  @Post('createFaq')
  async createFaq(@Body() createFaqData: createFaqDto) {
    const faq = this.faqService.createQuestion(createFaqData);
    return faq;
  }
}
