// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

interface Request{

}

class CreateTransactionService {
  public async execute({}: Request): Promise<Transaction> {

  }
}

export default CreateTransactionService;
