import {EntityRepository, Repository} from 'typeorm';
import Transaction from '../models/Transaction';

interface CreateTransaction{
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface idDTO {
  id: string | 'uuid';
}

interface TransactionList{
  transactions: Transaction[];
  balance: Balance;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = transactions.reduce((total, transaction) => {
      if (transaction.type == 'income') {
        return total + Number(transaction.value);
      }
      return total;
    }, 0);

    const outcome = transactions.reduce((total, transaction) => {
      if (transaction.type == 'outcome') {
        return total + Number(transaction.value);
      }
      return total;
    }, 0);

    const total = income - outcome;

    return { income, outcome, total };
  }

  public async listAllTransactions(): Promise<TransactionList>{
    const transactions = await this.find();

    const balance = await this.getBalance();

    return {transactions, balance};
  }

  public async findTransaction({id} : idDTO): Promise<Transaction | null>{
    const transaction = await this.findOne({ where: { id }});

    if (transaction){
      return transaction;
    }

    return null;
  }
}

export default TransactionsRepository;
