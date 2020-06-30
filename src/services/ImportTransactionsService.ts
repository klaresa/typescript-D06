import {getCustomRepository, getRepository, In} from "typeorm";
import Transaction from '../models/Transaction';
import csvParse from 'csv-parse';
import fs from 'fs';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from "../models/Category";

interface csvDT {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const stream = fs.createReadStream(filePath);

    const parsers = csvParse({
      from_line: 2,
    });

    const parseCSV = stream.pipe(parsers);

    const transactions: csvDT[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [ title, type, value, category ] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);

      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));
    const existingCategories = await categoryRepository.find({
      where: {
        title: In(categories),
      }
    });

    const existingTitles = existingCategories.map((category: Category) => category.title);

    const remaining = categories
      .filter(category => !existingTitles.includes(category))
      .filter(((value, index, self) => self.indexOf(value) === index));

    const newCategories = categoryRepository.create(
      remaining.map(title => ({
        title
      }))
    );

    await categoryRepository.save(newCategories);
    const allCategories = [...newCategories, ...existingCategories];
    console.log(existingCategories);

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: allCategories.find(category => category.title === transaction.category),
      })),
    );

    await transactionsRepository.save(createdTransactions);
    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
