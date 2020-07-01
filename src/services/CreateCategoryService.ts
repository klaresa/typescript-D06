import Category from '../models/Category';
import { getRepository } from "typeorm";
import AppError from '../errors/AppError';

interface Request {
  title: string;
}

class CreateCategoryService{
  public async execute({ title }: Request) : Promise<Category>{

    const categoryRepository = getRepository(Category);

    const catExists = await categoryRepository.findOne({ where : { title }});

    if (catExists) {
      throw new AppError("Category already exists", 403)
    }

    const category = categoryRepository.create({ title });

    await categoryRepository.save(category);

    return category;
  }
}

export default CreateCategoryService;
