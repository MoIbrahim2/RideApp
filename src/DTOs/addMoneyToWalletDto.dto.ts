import { IsNotEmpty } from 'class-validator';

export class AddMoneyToWallet {
  @IsNotEmpty()
  transactionId: number;

  @IsNotEmpty()
  amount: number;
}
