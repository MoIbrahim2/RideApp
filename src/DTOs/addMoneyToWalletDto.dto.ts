import { IsNotEmpty, Min } from 'class-validator';

export class AddMoneyToWallet {
  @IsNotEmpty()
  transactionId: number;

  @IsNotEmpty()
  @Min(1)
  amount: number;
}
