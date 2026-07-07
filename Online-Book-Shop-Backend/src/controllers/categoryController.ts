// controllers/category.controller.ts

import { Request, Response } from 'express';
import Category from '../models/Category.models';
import asyncHandler from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.create(req.body);

  const response = new ApiResponse(
    201,
    { category },
    "Category created successfully"
  );

  res.status(response.statusCode).json(response);
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Category.findAll();

  const response = new ApiResponse(
    200,
    { categories },
    "Categories fetched successfully"
  );

  res.status(response.statusCode).json(response);
});