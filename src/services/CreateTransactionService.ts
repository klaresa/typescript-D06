import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from "typeorm";
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from "./CreateCategoryService";

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface RequestD {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {

  public async execute({title, value, type, category }: RequestD): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const createCategoryService = new CreateCategoryService();
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value ) {
      throw new AppError("Not enough resources")
    }

    let transCategory = await categoryRepository.findOne({ where : { title: category }});

    if (!transCategory) {
      transCategory = await createCategoryService.execute({ title: category });
    }

    const transaction = transactionsRepository.create({ title, value, type, category_id: transCategory.id });
    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
