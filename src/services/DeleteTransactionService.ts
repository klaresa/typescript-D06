import { getCustomRepository } from "typeorm";
import TransactionRepository from '../repositories/TransactionsRepository';
import AppError from "../errors/AppError";

interface idDTO {
  id: string | 'uuid';
}

class DeleteTransactionService {
  public async execute({ id } : idDTO): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const exists = await transactionRepository.findTransaction({id});

    if (exists === null){
      throw new AppError("Id not found!", 404)
    }
    await transactionRepository.remove(exists);
  }
}

export default DeleteTransactionService;
